// market-research Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const { property_id, account_id } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    const apifyToken = Deno.env.get('APIFY_API_TOKEN')

    const { data: property, error: propertyError } = await supabase
      .from('properties').select('*').eq('property_id', property_id).single()
    if (propertyError) throw propertyError

    const researchResults: any = { timestamp: new Date().toISOString(), sources: [] }

    if (apifyToken) {
      try {
        const zillowData = await researchZillow(property, apifyToken)
        researchResults.zillow = zillowData
        researchResults.sources.push('zillow')
      } catch (e) { console.error('Zillow failed:', e.message) }

      try {
        const redfinData = await researchRedfin(property, apifyToken)
        researchResults.redfin = redfinData
        researchResults.sources.push('redfin')
      } catch (e) { console.error('Redfin failed:', e.message) }
    }

    const arv = researchResults.zillow?.arv || researchResults.redfin?.arv || null
    const rentEstimate = researchResults.zillow?.rent || researchResults.redfin?.rent || null
    const pricePerSqft = property.sqft && arv ? Math.round(arv / property.sqft) : null
    const cashOnCash = calculateCashOnCash(property.price, arv, rentEstimate)
    const dscr = calculateDSCR(property.price, rentEstimate)
    const capRate = calculateCapRate(property.price, rentEstimate)
    const irr = calculateIRR(property.price, arv)
    const recommendedStrategy = recommendStrategy({ price: property.price, arv, rent: rentEstimate, cashOnCash, dscr })

    await supabase.from('properties').update({
      arv, rent_str: rentEstimate, price_per_sqft: pricePerSqft,
      cash_on_cash: cashOnCash, dscr, cap_rate: capRate, irr,
      strategy_recommended: recommendedStrategy, market_research: researchResults,
      pipeline_status: 'underwriting', updated_at: new Date().toISOString()
    }).eq('property_id', property_id)

    await supabase.functions.invoke('underwrite-property', { body: { property_id, account_id } })

    return new Response(JSON.stringify({ success: true, property_id, research: researchResults, metrics: { arv, rentEstimate, cashOnCash, dscr, capRate, irr }, recommendedStrategy }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

async function researchZillow(property: any, apifyToken: string) {
  const searchQuery = `${property.address} ${property.city} ${property.state} ${property.zip}`
  const response = await fetch('https://api.apify.com/v2/acts/apify~zillow-scraper/run', { method: 'POST', headers: { 'Authorization': `Bearer ${apifyToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ startUrls: [{ url: `https://www.zillow.com/homedetails/${searchQuery}` }], proxy: { useApifyProxy: true } }) })
  if (!response.ok) throw new Error('Zillow API failed')
  const result = await response.json()
  return await waitForApifyResult(apifyToken, result.data.id)
}

async function researchRedfin(property: any, apifyToken: string) {
  const searchQuery = `${property.address} ${property.city} ${property.state}`
  const response = await fetch('https://api.apify.com/v2/acts/apify~redfin-scraper/run', { method: 'POST', headers: { 'Authorization': `Bearer ${apifyToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ startUrls: [{ url: `https://www.redfin.com/${searchQuery}` }], proxy: { useApifyProxy: true } }) })
  if (!response.ok) throw new Error('Redfin API failed')
  const result = await response.json()
  return await waitForApifyResult(apifyToken, result.data.id)
}

async function waitForApifyResult(token: string, runId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, { headers: { 'Authorization': `Bearer ${token}` } })
    const data = await response.json()
    if (data.data.status === 'SUCCEEDED') {
      const items = await (await fetch(`https://api.apify.com/v2/datasets/${data.data.defaultDatasetId}/items`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
      return items[0] || {}
    }
    if (data.data.status === 'FAILED') throw new Error('Apify failed')
  }
  throw new Error('Apify timeout')
}

function calculateCashOnCash(price: number, arv: number, rent: number): number {
  if (!price || !rent) return 0
  const totalInvestment = price * 0.23
  const annualNOI = rent * 12 * 0.20
  const annualDebtService = price * 0.80 * 0.06 * 12
  const annualCashFlow = annualNOI - annualDebtService
  return Math.round((annualCashFlow / totalInvestment) * 100 * 100) / 100
}

function calculateDSCR(price: number, rent: number): number {
  if (!price || !rent) return 0
  const annualNOI = rent * 12 * 0.20
  const annualDebtService = price * 0.80 * 0.06 * 12
  return annualNOI > 0 ? Math.round((annualNOI / annualDebtService) * 100) / 100 : 0
}

function calculateCapRate(price: number, rent: number): number {
  if (!price || !rent) return 0
  return Math.round((rent * 12 * 0.20 / price) * 10000) / 100
}

function calculateIRR(price: number, arv: number): number {
  if (!price || !arv) return 0
  return Math.round((arv * 0.20 / price) * 10000) / 100
}

function recommendStrategy(metrics: any): string {
  const { cashOnCash, dscr, price, arv } = metrics
  if (cashOnCash > 15 && dscr > 1.5) return 'long_term_rental'
  if (cashOnCash > 25 && price < arv * 0.7) return 'flip'
  if (cashOnCash > 10 && dscr > 1.25) return 'lease_option'
  if (cashOnCash > 5 && price < arv * 0.6) return 'wholesale'
  if (dscr > 1.5) return 'brrrr'
  return 'hold'
}
