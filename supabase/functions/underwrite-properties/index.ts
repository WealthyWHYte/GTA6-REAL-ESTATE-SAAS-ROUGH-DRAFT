// SMART AI Underwriter - Based on Creative Finance Framework
// Analyzes: Motivation, Equity, Existing Mortgage, Cash Flow, Market Potential
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Calculate mortgage payment
function calculatePayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0
  const monthlyRate = annualRate / 100 / 12
  const numPayments = years * 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
}

// ============================================
// PHASE 1: MOTIVATION SCORING (0-30 pts)
// ============================================
function calculateMotivationScore(property: any): number {
  let score = 0
  const dom = property.days_on_market || 0
  const listingStatus = property.listing_status?.toLowerCase() || ''
  
  if (dom > 90) score += 15
  else if (dom > 60) score += 10
  else if (dom > 30) score += 5
  
  if (listingStatus.includes('reduced') || listingStatus.includes('price cut')) score += 10
  if (listingStatus.includes('expired') || listingStatus.includes('withdrawn')) score += 10
  if (property.owner_occupied === false) score += 5
  if (property.owner_type?.toLowerCase().includes('trust')) score += 5
  if (property.owner_type?.toLowerCase().includes('individual')) score += 3
  
  return Math.min(30, score)
}

// ============================================
// PHASE 2: EQUITY POSITION (0-25 pts)
// ============================================
function calculateEquityScore(equityPercent: number, isFreeAndClear: boolean): number {
  if (isFreeAndClear) return 25
  if (equityPercent > 50) return 25
  if (equityPercent > 30) return 20
  if (equityPercent > 20) return 15
  if (equityPercent > 10) return 10
  return 5
}

// ============================================
// PHASE 3: EXISTING MORTGAGE (0-20 pts)
// ============================================
function calculateMortgageScore(rate: number, hasMortgage: boolean): number {
  if (!hasMortgage) return 20
  if (rate < 4.5) return 20
  if (rate < 5.5) return 15
  if (rate < 6.5) return 10
  if (rate < 7.5) return 5
  return 0
}

// ============================================
// PHASE 4: CASH FLOW (0-15 pts)
// ============================================
function calculateCashflowScore(monthlyRent: number, totalDebtService: number): { score: number; dscr: number } {
  if (monthlyRent <= 0 || totalDebtService <= 0) return { score: 0, dscr: 0 }
  const dscr = monthlyRent / totalDebtService
  if (dscr >= 1.3) return { score: 15, dscr }
  if (dscr >= 1.2) return { score: 12, dscr }
  if (dscr >= 1.1) return { score: 10, dscr }
  if (dscr >= 1.0) return { score: 5, dscr }
  return { score: 0, dscr }
}

// ============================================
// PHASE 5: MARKET POTENTIAL (0-10 pts)
// ============================================
const TIER_1 = ['miami', 'austin', 'phoenix', 'tampa', 'orlando', 'atlanta', 'dallas', 'houston']
const TIER_2 = ['augusta', 'grovetown', 'charlotte', 'raleigh', 'nashville', 'denver']

function calculateMarketScore(city?: string): number {
  const loc = (city || '').toLowerCase()
  if (TIER_1.some(m => loc.includes(m))) return 10
  if (TIER_2.some(m => loc.includes(m))) return 7
  return 5
}

// ============================================
// STRATEGY SELECTION
// ============================================
function selectStrategy(equityPercent: number, isFreeAndClear: boolean, hasMortgage: boolean, existingRate: number, motivationScore: number) {
  if (isFreeAndClear) {
    return { strategy: 'Seller Finance', reasoning: 'Free & clear - seller carries 100%' }
  }
  if (equityPercent < 20 && motivationScore >= 15) {
    return { strategy: 'Subject-To', reasoning: `Low equity (${equityPercent.toFixed(0)}%) + motivated` }
  }
  if (equityPercent < 20 && existingRate < 5) {
    return { strategy: 'Subject-To', reasoning: `Great rate (${existingRate}%) - preserve it` }
  }
  if (equityPercent >= 20 && equityPercent <= 50) {
    return { strategy: 'Hybrid', reasoning: `Medium equity - combine Sub-To + carryback` }
  }
  if (equityPercent > 50) {
    return { strategy: 'Seller Finance', reasoning: `High equity (${equityPercent.toFixed(0)}%)` }
  }
  return { strategy: 'Seller Finance', reasoning: 'Default structure' }
}

// ============================================
// SMART TERMS CALCULATION
// ============================================
function calculateSmartTerms(strategy: string, listingPrice: number, existingRate: number, existingBalance: number, monthlyRent: number, isFreeAndClear: boolean) {
  let result = {
    offer_price: listingPrice,
    offer_percent: 100,
    down_payment: 0,
    interest_rate: 0,
    amortization_years: 40,
    balloon_years: null as number | null,
    subject_to_balance: 0,
    seller_carryback: 0,
    total_monthly_payment: 0,
    structure: ''
  }
  
  if (strategy === 'Subject-To') {
    result.structure = 'Subject-To'
    result.subject_to_balance = existingBalance
    result.down_payment = Math.min(listingPrice * 0.05, 25000)
    result.offer_price = existingBalance + result.down_payment
    result.offer_percent = (result.offer_price / listingPrice) * 100
    result.interest_rate = existingRate
    result.total_monthly_payment = calculatePayment(existingBalance, existingRate, 30)
    result.balloon_years = 7
    
  } else if (strategy === 'Hybrid') {
    result.structure = 'Hybrid (Sub-To + Seller Carryback)'
    result.subject_to_balance = existingBalance
    result.down_payment = listingPrice * 0.03
    result.seller_carryback = listingPrice - existingBalance - result.down_payment
    result.offer_price = listingPrice
    result.interest_rate = Math.min(existingRate, 4)
    result.total_monthly_payment = calculatePayment(existingBalance, existingRate, 30) + calculatePayment(result.seller_carryback, result.interest_rate, 40)
    result.balloon_years = 10
    
  } else { // Seller Finance
    result.structure = 'Seller Finance'
    result.down_payment = listingPrice * 0.03
    result.seller_carryback = listingPrice - result.down_payment
    result.interest_rate = 4
    result.total_monthly_payment = calculatePayment(result.seller_carryback, 4, 40)
    result.balloon_years = 10
  }
  
  return result
}

// ============================================
// MAIN ANALYSIS
// ============================================
function analyzeProperty(property: any) {
  const listingPrice = property.listing_price || 0
  const monthlyRent = property.estimated_rent || (listingPrice * 0.006)
  const existingBalance = property.mortgage_balance || 0
  const equityAmount = listingPrice - existingBalance
  const equityPercent = listingPrice > 0 ? (equityAmount / listingPrice) * 100 : 0
  const isFreeAndClear = existingBalance <= 0 || !property.mortgage_balance
  const existingRate = property.interest_rate || 6.5
  
  const motivationScore = calculateMotivationScore(property)
  const equityScore = calculateEquityScore(equityPercent, isFreeAndClear)
  const mortgageScore = calculateMortgageScore(existingRate, !isFreeAndClear)
  const { score: cashflowScore, dscr } = calculateCashflowScore(monthlyRent, monthlyRent * 0.9)
  const marketScore = calculateMarketScore(property.city)
  
  const totalScore = motivationScore + equityScore + mortgageScore + cashflowScore + marketScore
  const { strategy, reasoning } = selectStrategy(equityPercent, isFreeAndClear, !isFreeAndClear, existingRate, motivationScore)
  const terms = calculateSmartTerms(strategy, listingPrice, existingRate, existingBalance, monthlyRent, isFreeAndClear)
  
  let riskLevel: 'low' | 'medium' | 'high' = dscr >= 1.3 ? 'low' : dscr < 1.0 ? 'high' : 'medium'
  
  return {
    property_id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    listing_price: listingPrice,
    mortgage_balance: existingBalance,
    equity_amount: equityAmount,
    equity_percent: equityPercent,
    is_free_and_clear: isFreeAndClear,
    existing_rate: existingRate,
    
    // Scores
    motivation_score: motivationScore,
    equity_score: equityScore,
    mortgage_score: mortgageScore,
    cashflow_score: cashflowScore,
    market_score: marketScore,
    total_score: totalScore,
    
    // Strategy
    recommended_strategy: strategy,
    strategy_reasoning: reasoning,
    
    // Terms
    offer_price: terms.offer_price,
    offer_percent: terms.offer_percent,
    down_payment: terms.down_payment,
    interest_rate: terms.interest_rate,
    amortization_years: terms.amortization_years,
    balloon_years: terms.balloon_years,
    subject_to_balance: terms.subject_to_balance,
    seller_carryback: terms.seller_carryback,
    total_monthly_payment: terms.total_monthly_payment,
    structure: terms.structure,
    projected_dscr: dscr,
    
    // Validation
    dscr_valid: dscr >= 1.1,
    risk_level: riskLevel
  }
}

// ============================================
// SUPABASE FUNCTION
// ============================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { property_ids } = await req.json()

    console.log('🏠 SMART Underwriter: Analyzing with motivation + equity + cashflow logic')

    let query = supabaseClient.from('properties').select('*').eq('account_id', user.id).not('listing_price', 'is', null)
    if (property_ids?.length > 0) query = query.in('id', property_ids)
    const { data: properties, error: propError } = await query.limit(50)

    if (propError || !properties?.length) throw new Error('No properties found')

    console.log(`📊 Analyzing ${properties.length} properties with SMART logic`)

    const analyses = []

    for (const property of properties) {
      const analysis = analyzeProperty(property)
      
      // Save to property_analysis table
      await supabaseClient.from('property_analysis').upsert({
        property_id: property.id,
        account_id: user.id,
        reasoning: `${analysis.strategy_reasoning}. Equity: $${analysis.equity_amount.toLocaleString()} (${analysis.equity_percent.toFixed(0)}%). DSCR: ${analysis.projected_dscr.toFixed(2)}`,
        recommendation: `${analysis.recommended_strategy} - ${analysis.structure}`,
        strategy: analysis.recommended_strategy,
        win_win_score: analysis.total_score,
        max_score: 100,
        offer_price: analysis.offer_price,
        offer_percent: analysis.offer_percent,
        factors: `${Math.round(analysis.offer_price/1000)}|${analysis.total_score}|${analysis.recommended_strategy.substring(0,3)}`
      })

      // Update property
      await supabaseClient.from('properties').update({
        estimated_equity: analysis.equity_amount,
        pipeline_status: 'underwriting_complete'
      }).eq('id', property.id)

      analyses.push(analysis)
      console.log(`✅ ${property.address}: ${analysis.recommended_strategy} | Score: ${analysis.total_score} | DSCR: ${analysis.projected_dscr.toFixed(2)}`)
    }

    return new Response(JSON.stringify({
      success: true,
      analyses,
      total_analyzed: analyses.length,
      message: `Smart underwriting complete. ${analyses.filter(a => a.recommended_strategy === 'Subject-To').length} Subject-To, ${analyses.filter(a => a.recommended_strategy === 'Hybrid').length} Hybrid, ${analyses.filter(a => a.recommended_strategy === 'Seller Finance').length} Seller Finance`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error: any) {
    console.error('❌ Underwriting error:', error)
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    })
  }
})
