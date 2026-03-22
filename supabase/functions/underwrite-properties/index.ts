// SMART UNDERWRITER - Jerry Norton Creative Finance Framework
// Equity Classes: Low (<35%), High (>35%), Free & Clear
// Strategies: Subject-To, Seller Finance, Hybrid, Wholesale
// Default Exit: WHOLESALE to buyer

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calcPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0
  const r = annualRate / 100 / 12
  const n = years * 12
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function estimateRent(listPrice: number, sqft: number): number {
  // South Florida rent estimate: ~0.5% of value/month or $2/sqft
  const byValue = listPrice * 0.005
  const bySqft = sqft > 0 ? sqft * 2 : 0
  return Math.round(bySqft > 0 ? (byValue + bySqft) / 2 : byValue)
}

function getEquityClass(equityPct: number, hasMortgage: boolean): string {
  if (!hasMortgage) return 'free_and_clear'
  if (equityPct >= 35) return 'high'
  return 'low'
}

function getStrategy(equityClass: string, dom: number, listPrice: number): any {
  // MLS lead - need enough down for agent commissions (3-6%)
  const agentCommission = Math.round(listPrice * 0.06)

  if (equityClass === 'free_and_clear') {
    return {
      primary: 'Seller Finance',
      secondary: 'Lease Option',
      exit: 'Wholesale or Hold',
      note: 'Free & clear - seller can carry note. Negotiate 0-10% down, 40yr amort, 0-5% rate.',
      offer_pct: 100,
      down_pct: 0.05,
      rate: 5,
      term: 40,
      balloon: 10,
    }
  }
  if (equityClass === 'high') {
    if (dom >= 90) {
      return {
        primary: 'Subject-To + Seller Finance Hybrid',
        secondary: 'Subject-To',
        exit: 'Wholesale to Creative Buyer',
        note: `High equity + motivated (${dom}d DOM). Assume mortgage, seller finances equity gap at <4%.`,
        offer_pct: 100,
        down_pct: 0.03,
        rate: 4,
        term: 40,
        balloon: 10,
      }
    }
    return {
      primary: 'Subject-To + Seller Finance Hybrid',
      secondary: 'Cash Offer 70%',
      exit: 'Wholesale or Hold',
      note: 'High equity - hybrid structure. Assume mortgage + seller carries equity gap.',
      offer_pct: 100,
      down_pct: 0.05,
      rate: 5,
      term: 40,
      balloon: 10,
    }
  }
  // Low equity
  if (dom >= 90) {
    return {
      primary: 'Subject-To',
      secondary: 'Cash 70%',
      exit: 'Wholesale to Cash Buyer',
      note: `Low equity + highly motivated (${dom}d DOM). Subject-To with small cash to seller. Fast close.`,
      offer_pct: 100,
      down_pct: 0.03,
      rate: 0, // take over existing rate
      term: 30,
      balloon: 7,
    }
  }
  return {
    primary: 'Subject-To',
    secondary: 'Cash 70%',
    exit: 'Wholesale',
    note: 'Low equity - take over existing mortgage. Need enough down to cover MLS agent commissions.',
    offer_pct: 100,
    down_pct: 0.06, // covers agent
    rate: 0,
    term: 30,
    balloon: 7,
  }
}

function scoreProperty(property: any): any {
  const listPrice = property.listing_price || 0
  const estValue = property.estimated_value || listPrice
  // Try mortgage balance, fall back to last_sale_amount * 0.8 (assume 80% LTV)
  const mortgage = property.open_mortgage_balance || property.mortgage_balance || (property.last_sale_amount ? Math.round(property.last_sale_amount * 0.8) : 0)
  const dom = property.days_on_market || 0
  const sqft = property.sqft || property.living_square_feet || 0
  // Try interest rate, fall back to 5.5% avg for properties without data
  const intRate = property.interest_rate || property.recorded_mortgage_interest_rate || (mortgage > 0 ? 5.5 : 0)
  const hasMortgage = mortgage > 0

  const equity = hasMortgage ? (listPrice - mortgage) : listPrice
  const equityPct = listPrice > 0 ? (equity / listPrice) * 100 : 0
  const equityClass = getEquityClass(equityPct, hasMortgage)
  const strategy = getStrategy(equityClass, dom, listPrice)

  // === SCORING (0-100) ===
  // Motivation (0-30pts)
  let motivationScore = 0
  if (dom >= 180) motivationScore = 25
  else if (dom >= 90) motivationScore = 20
  else if (dom >= 60) motivationScore = 15
  else if (dom >= 30) motivationScore = 8

  // Equity Position (0-25pts)
  let equityScore = 0
  if (equityClass === 'free_and_clear') equityScore = 25
  else if (equityPct >= 50) equityScore = 22
  else if (equityPct >= 35) equityScore = 17
  else if (equityPct >= 20) equityScore = 12
  else equityScore = 6

  // Mortgage Rate Advantage (0-20pts)
  let rateScore = 0
  if (!hasMortgage) rateScore = 15 // seller finance path
  else if (intRate < 3.5) rateScore = 20
  else if (intRate < 4.5) rateScore = 15
  else if (intRate < 5.5) rateScore = 8
  else rateScore = 2

  // Cash Flow Check (0-15pts) - monthly payment vs estimated rent
  const estimatedRent = estimateRent(listPrice, sqft)
  const offerPrice = listPrice * (strategy.offer_pct / 100)
  const downPayment = offerPrice * strategy.down_pct
  const financeAmount = hasMortgage ? (equity * 0.97) : (offerPrice - downPayment)
  const useRate = strategy.rate > 0 ? strategy.rate : intRate
  const monthlyPayment = hasMortgage
    ? calcPayment(mortgage, intRate, 30) + calcPayment(financeAmount, useRate, strategy.term)
    : calcPayment(financeAmount, useRate, strategy.term)
  const cashFlow = estimatedRent - monthlyPayment
  const dscr = monthlyPayment > 0 ? estimatedRent / monthlyPayment : 0

  let cashFlowScore = 0
  if (dscr >= 1.4) cashFlowScore = 15
  else if (dscr >= 1.2) cashFlowScore = 10
  else if (dscr >= 1.0) cashFlowScore = 5
  else cashFlowScore = 0

  // Market Score (0-10pts)
  const tier1Cities = ['miami', 'fort lauderdale', 'coral gables', 'miami beach', 'brickell', 'coconut grove']
  const city = (property.city || '').toLowerCase()
  const marketScore = tier1Cities.some(c => city.includes(c)) ? 10 : 7

  const totalScore = Math.min(100, motivationScore + equityScore + rateScore + cashFlowScore + marketScore)

  // Score classification
  let classification = 'Pass'
  let classColor = 'gray'
  if (totalScore >= 80) { classification = 'Elite Deal'; classColor = 'gold' }
  else if (totalScore >= 65) { classification = 'Strong Deal'; classColor = 'green' }
  else if (totalScore >= 50) { classification = 'Viable Deal'; classColor = 'blue' }
  else if (totalScore >= 35) { classification = 'Marginal'; classColor = 'orange' }

  // Entry Fee
  const cashToSeller = offerPrice * 0.03
  const agentCommission = offerPrice * 0.06
  const payMyself = offerPrice * 0.03
  const closingCosts = 3000
  const reno = property.estimated_repairs || 10000
  const maintenance = 2000
  const marketing = 2000
  const totalEntryFee = cashToSeller + agentCommission + payMyself + closingCosts + reno + maintenance + marketing
  const entryFeePct = offerPrice > 0 ? (totalEntryFee / offerPrice) * 100 : 0

  // Offer Bands
  const level1Price = Math.round(listPrice * 0.70)
  const level2Price = Math.round(listPrice * 0.70)
  const level3Price = listPrice

  return {
    property_id: property.id,
    address: property.address || property.listing_address,
    city: property.city,
    state: property.state,
    listing_price: listPrice,
    mortgage_balance: mortgage,
    equity_amount: equity,
    equity_percent: Math.round(equityPct * 10) / 10,
    equity_class: equityClass,

    // Scores
    motivation_score: motivationScore,
    equity_score: equityScore,
    win_win_score: totalScore,
    max_score: 100,
    classification,

    // Strategy
    strategy: strategy.primary,
    secondary_strategy: strategy.secondary,
    exit_strategy: strategy.exit,
    reasoning: strategy.note,
    recommendation: classification,

    // Offer
    offer_price: level3Price,
    offer_percent: 100,
    offer_percent_level1: 70,
    offer_percent_level2: 70,

    // Level 1
    level1_offer_price: level1Price,
    level1_entry_fee: totalEntryFee,
    level1_monthly_payment: Math.round(calcPayment(level1Price * 0.97, useRate, strategy.term)),
    level1_cash_to_seller: Math.round(level1Price * 0.03),
    level1_seller_carry_amount: Math.round(level1Price * 0.97),
    level1_seller_carry_rate: useRate,
    level1_seller_carry_term: strategy.term,

    // Level 2
    level2_offer_price: level2Price,
    level2_entry_fee: Math.round(totalEntryFee * 1.2),

    // Level 3
    level3_offer_price: level3Price,
    level3_entry_fee: Math.round(totalEntryFee),
    level3_monthly_payment: Math.round(monthlyPayment),
    level3_assume_mortgage: hasMortgage ? mortgage : 0,
    level3_seller_carry_amount: Math.round(financeAmount),
    level3_seller_carry_rate: useRate,
    level3_seller_carry_term: strategy.term,
    level3_cash_to_seller: Math.round(offerPrice * 0.03),

    // Recommended
    recommended_level: totalScore >= 60 ? 3 : totalScore >= 45 ? 2 : 1,
    recommended_reason: strategy.note,

    // Cash Flow
    estimated_rent: estimatedRent,
    monthly_payment: Math.round(monthlyPayment),
    monthly_cash_flow: Math.round(cashFlow),
    dscr: Math.round(dscr * 100) / 100,
    entry_fee_total: Math.round(totalEntryFee),
    entry_fee_pct: Math.round(entryFeePct * 10) / 10,

    // Comps
    comps_count: 0,
    comps_avg_price: 0,
    comps_data: null,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { property_ids } = await req.json()

    let query = serviceClient.from('properties').select('*').eq('account_id', user.id).not('listing_price', 'is', null)
    if (property_ids?.length > 0) query = query.in('id', property_ids)
    const { data: properties, error: propError } = await query.limit(1000)
    if (propError || !properties?.length) throw new Error('No properties found')

    await serviceClient.from('property_analysis').delete().eq('account_id', user.id)

    console.log(`📊 Analyzing ${properties.length} properties - Jerry Norton Framework`)

    const analyses = []
    for (const property of properties) {
      const analysis = scoreProperty(property)
      const { error: insertError } = await serviceClient.from('property_analysis').insert({
        property_id: analysis.property_id,
        account_id: user.id,
        address: analysis.address,
        city: analysis.city,
        state: analysis.state,
        reasoning: analysis.reasoning,
        recommendation: analysis.classification,
        strategy: analysis.strategy,
        win_win_score: analysis.win_win_score,
        max_score: 100,
        offer_price: analysis.offer_price,
        offer_percent: analysis.offer_percent,
        level1_offer_price: analysis.level1_offer_price,
        level1_entry_fee: analysis.level1_entry_fee,
        level1_monthly_payment: analysis.level1_monthly_payment,
        level1_cash_to_seller: analysis.level1_cash_to_seller,
        level1_seller_carry_amount: analysis.level1_seller_carry_amount,
        level1_seller_carry_rate: analysis.level1_seller_carry_rate,
        level1_seller_carry_term: analysis.level1_seller_carry_term,
        level2_offer_price: analysis.level2_offer_price,
        level2_entry_fee: analysis.level2_entry_fee,
        level3_offer_price: analysis.level3_offer_price,
        level3_entry_fee: analysis.level3_entry_fee,
        level3_monthly_payment: analysis.level3_monthly_payment,
        level3_assume_mortgage: analysis.level3_assume_mortgage,
        level3_seller_carry_amount: analysis.level3_seller_carry_amount,
        level3_seller_carry_rate: analysis.level3_seller_carry_rate,
        level3_seller_carry_term: analysis.level3_seller_carry_term,
        level3_cash_to_seller: analysis.level3_cash_to_seller,
        recommended_level: analysis.recommended_level,
        recommended_reason: analysis.recommended_reason,
        comps_count: 0,
        comps_avg_price: 0,
        comps_data: null,
      })
      if (insertError) console.error(`❌ Insert failed ${analysis.address}:`, JSON.stringify(insertError))
      else console.log(`✅ ${analysis.address} | ${analysis.strategy} | Score: ${analysis.win_win_score} | ${analysis.classification}`)
      analyses.push(analysis)
    }

    const elite = analyses.filter(a => a.win_win_score >= 80)
    const strong = analyses.filter(a => a.win_win_score >= 65)
    const viable = analyses.filter(a => a.win_win_score >= 50)

    return new Response(JSON.stringify({
      success: true,
      analyses,
      total_analyzed: analyses.length,
      elite_count: elite.length,
      strong_count: strong.length,
      viable_count: viable.length,
      message: `Analysis complete. Elite: ${elite.length}, Strong: ${strong.length}, Viable: ${viable.length}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error: any) {
    console.error('❌ Underwriting error:', error)
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    })
  }
})
