// SMART UNDERWRITER - 3 LEVEL STRUCTURE WITH ENTRY FEES
// Level 1: 70% + Terms
// Level 2: 70% Cash
// Level 3: 100% + Terms (Subject-To + Seller Finance)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// ENTRY FEE CALCULATION (All 7 Components)
// ============================================
function calculateEntryFee(offerPrice: number, property: any) {
  const cashToSeller = offerPrice * 0.03  // 3% cash to seller
  const agentCommission = offerPrice * 0.03  // 3% agent
  const payMyself = offerPrice * 0.03  // 3% pay myself
  const arrears = property.arrears_amount || 0
  const liens = property.lien_amount || 0
  const closingCosts = 3000  // Title, escrow
  const renovation = property.estimated_repairs || 10000
  const maintenanceReserve = 5000  // 6 months
  const marketing = 2000

  const totalEntryFee = cashToSeller + agentCommission + payMyself + arrears + liens + closingCosts + renovation + maintenanceReserve + marketing

  return {
    cash_to_seller: cashToSeller,
    agent_commission: agentCommission,
    pay_myself: payMyself,
    arrears: arrears,
    liens: liens,
    closing_costs: closingCosts,
    renovation: renovation,
    maintenance_reserve: maintenanceReserve,
    marketing: marketing,
    total: totalEntryFee
  }
}

// ============================================
// MORTGAGE PAYMENT CALCULATOR
// ============================================
function calculatePayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0
  const monthlyRate = annualRate / 100 / 12
  const numPayments = years * 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
}

// ============================================
// LEVEL 1: 70% + TERMS (Seller Finance)
// ============================================
function calculateLevel1(listingPrice: number, property: any) {
  const offerPrice = listingPrice * 0.70
  const entryFee = calculateEntryFee(offerPrice, property)

  // Seller carry structure
  const cashToSeller = offerPrice * 0.03  // 3% down
  const sellerCarryAmount = offerPrice - cashToSeller
  const sellerCarryRate = 0.05  // 5% interest
  const sellerCarryTerm = 30  // 30 years

  const monthlyPayment = calculatePayment(sellerCarryAmount, sellerCarryRate * 100, sellerCarryTerm)

  return {
    level: 1,
    name: "70% + Terms",
    offer_price: offerPrice,
    structure: "Seller Finance",
    cash_to_seller: cashToSeller,
    seller_carry_amount: sellerCarryAmount,
    seller_carry_rate: sellerCarryRate * 100,
    seller_carry_term: sellerCarryTerm,
    monthly_payment: monthlyPayment,
    entry_fee: entryFee.total,
    entry_fee_breakdown: entryFee,
    seller_gets_now: cashToSeller,
    seller_gets_total: cashToSeller + sellerCarryAmount,
    pros: ["Low entry fee", "Seller gets note income", "No bank qualification"],
    cons: ["Lower offer (70%)", "Seller waits for full payment"]
  }
}

// ============================================
// LEVEL 2: 70% CASH (All Cash Offer)
// ============================================
function calculateLevel2(listingPrice: number, property: any) {
  const offerPrice = listingPrice * 0.70
  const entryFee = calculateEntryFee(offerPrice, property)

  return {
    level: 2,
    name: "70% All Cash",
    offer_price: offerPrice,
    structure: "Cash Purchase",
    cash_to_seller: offerPrice,
    seller_carry_amount: 0,
    seller_carry_rate: 0,
    seller_carry_term: 0,
    monthly_payment: 0,
    entry_fee: entryFee.total,
    entry_fee_breakdown: entryFee,
    seller_gets_now: offerPrice,
    seller_gets_total: offerPrice,
    pros: ["Fast close (7 days)", "Clean simple deal", "No contingencies"],
    cons: ["High entry fee", "Lower offer (70%)"]
  }
}

// ============================================
// LEVEL 3: 100% + TERMS (Subject-To + Seller Finance)
// ============================================
function calculateLevel3(listingPrice: number, property: any) {
  const offerPrice = listingPrice  // 100% of asking

  const hasMortgage = property.mortgage_balance && property.mortgage_balance > 0
  const existingBalance = property.mortgage_balance || 0
  const existingRate = property.interest_rate || 4
  const existingMonthlyPayment = hasMortgage ? calculatePayment(existingBalance, existingRate, 30) : 0

  const equityAmount = listingPrice - existingBalance

  let assumeMortgage = 0
  let sellerCarryAmount = 0
  let sellerCarryRate = 0.03  // Default 3%
  let sellerCarryTerm = 50  // 50 years
  let totalMonthly = 0

  if (hasMortgage) {
    // HYBRID: Subject-To + Seller Finance
    assumeMortgage = existingBalance
    sellerCarryAmount = equityAmount * 0.97  // After 3% cash
    sellerCarryRate = Math.min(existingRate / 100, 0.03)
    sellerCarryTerm = 50
    totalMonthly = existingMonthlyPayment + calculatePayment(sellerCarryAmount, sellerCarryRate * 100, sellerCarryTerm)
  } else {
    // PURE SELLER FINANCE (Free & Clear)
    sellerCarryAmount = offerPrice * 0.97
    sellerCarryRate = 0.03
    sellerCarryTerm = 50
    totalMonthly = calculatePayment(sellerCarryAmount, sellerCarryRate * 100, sellerCarryTerm)
  }

  const entryFee = calculateEntryFee(offerPrice, property)

  return {
    level: 3,
    name: "100% Full Price + Terms",
    offer_price: offerPrice,
    structure: hasMortgage ? "Subject-To + Seller Finance" : "Seller Finance",
    cash_to_seller: offerPrice * 0.03,
    assume_mortgage: assumeMortgage,
    seller_carry_amount: sellerCarryAmount,
    seller_carry_rate: sellerCarryRate * 100,
    seller_carry_term: sellerCarryTerm,
    monthly_payment: totalMonthly,
    entry_fee: entryFee.total,
    entry_fee_breakdown: entryFee,
    seller_gets_now: offerPrice * 0.03,
    seller_gets_total: offerPrice,
    pros: ["FULL asking price", "Win-win structure", "Low entry fee"],
    cons: ["Higher monthly payment", "Long-term commitment"]
  }
}

// ============================================
// STRATEGY RECOMMENDATION
// ============================================
function recommendBestLevel(property: any, level1: any, level2: any, level3: any) {
  const listingPrice = property.listing_price || 0
  const equityPercent = listingPrice > 0 ? ((listingPrice - (property.mortgage_balance || 0)) / listingPrice) * 100 : 0
  const hasMortgage = property.mortgage_balance && property.mortgage_balance > 0
  const highMotivation = (property.days_on_market || 0) > 90
  const distressed = (property.arrears_amount || 0) > 0

  // LEVEL 3: Best for medium-high equity + existing mortgage
  if (hasMortgage && equityPercent >= 25 && equityPercent <= 70) {
    return {
      level: 3,
      reason: `Subject-To opportunity: ${Math.round(equityPercent)}% equity, existing mortgage at ${property.interest_rate || 4}%. Seller gets full price, you get favorable terms.`
    }
  }

  // LEVEL 2: Best for distressed/high motivation
  if (distressed || highMotivation) {
    return {
      level: 2,
      reason: `Fast cash needed: ${distressed ? 'In arrears, ' : ''}${highMotivation ? property.days_on_market + ' DOM, ' : ''}seller likely motivated for quick close.`
    }
  }

  // LEVEL 1: Best for free & clear or high equity
  if (!hasMortgage || equityPercent > 70) {
    return {
      level: 1,
      reason: `${!hasMortgage ? 'Free & clear' : 'High equity (' + Math.round(equityPercent) + '%)'} - seller can carry note with favorable terms.`
    }
  }

  // DEFAULT: Level 3
  return {
    level: 3,
    reason: "Full price offer likely to get acceptance while maintaining creative terms."
  }
}

// ============================================
// MAIN ANALYSIS
// ============================================
function analyzeProperty(property: any) {
  const listingPrice = property.listing_price || 0

  // Calculate all 3 levels
  const level1 = calculateLevel1(listingPrice, property)
  const level2 = calculateLevel2(listingPrice, property)
  const level3 = calculateLevel3(listingPrice, property)

  // Recommend best strategy
  const recommendation = recommendBestLevel(property, level1, level2, level3)

  // Calculate motivation score (for win_win_score)
  let motivationScore = 0
  const dom = property.days_on_market || 0
  if (dom > 90) motivationScore += 15
  else if (dom > 60) motivationScore += 10
  else if (dom > 30) motivationScore += 5

  // Equity score
  const equityPercent = listingPrice > 0 ? ((listingPrice - (property.mortgage_balance || 0)) / listingPrice) * 100 : 0
  let equityScore = 0
  if (equityPercent > 50) equityScore = 25
  else if (equityPercent > 30) equityScore = 20
  else if (equityPercent > 20) equityScore = 15
  else equityScore = 10

  // Total score
  const totalScore = motivationScore + equityScore + 20  // Base 20 for deal existing

  return {
    property_id: property.id,
    address: property.address || property.listing_address,
    city: property.city,
    state: property.state,
    listing_price: listingPrice,
    mortgage_balance: property.mortgage_balance || 0,
    equity_amount: listingPrice - (property.mortgage_balance || 0),
    equity_percent: equityPercent,

    // Scores
    motivation_score: motivationScore,
    equity_score: equityScore,
    win_win_score: totalScore,
    max_score: 100,

    // Level 1
    level1_offer_price: level1.offer_price,
    level1_entry_fee: level1.entry_fee,
    level1_monthly_payment: level1.monthly_payment,
    level1_cash_to_seller: level1.cash_to_seller,
    level1_seller_carry_amount: level1.seller_carry_amount,
    level1_seller_carry_rate: level1.seller_carry_rate,
    level1_seller_carry_term: level1.seller_carry_term,

    // Level 2
    level2_offer_price: level2.offer_price,
    level2_entry_fee: level2.entry_fee,
    level2_cash_to_seller: level2.cash_to_seller,

    // Level 3
    level3_offer_price: level3.offer_price,
    level3_entry_fee: level3.entry_fee,
    level3_monthly_payment: level3.monthly_payment,
    level3_assume_mortgage: level3.assume_mortgage,
    level3_seller_carry_amount: level3.seller_carry_amount,
    level3_seller_carry_rate: level3.seller_carry_rate,
    level3_seller_carry_term: level3.seller_carry_term,
    level3_cash_to_seller: level3.cash_to_seller,

    // Recommendation
    recommended_level: recommendation.level,
    recommended_reason: recommendation.reason,
    recommended_strategy: recommendation.level === 1 ? 'Seller Finance' : recommendation.level === 2 ? 'Cash' : 'Subject-To',

    // Terms
    strategy: recommendation.level === 1 ? 'Seller Finance' : recommendation.level === 2 ? 'Cash' : 'Subject-To',
    reasoning: recommendation.reason,
    offer_price: recommendation.level === 1 ? level1.offer_price : recommendation.level === 2 ? level2.offer_price : level3.offer_price,
    offer_percent: recommendation.level === 1 ? 70 : recommendation.level === 2 ? 70 : 100,

    // Comps data placeholder
    comps_count: 0,
    comps_avg_price: 0,
    comps_data: null
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

    console.log('🏠 SMART Underwriter: Analyzing with 3-level structure')

    // Get properties - clear duplicates first
    let query = supabaseClient.from('properties').select('*').eq('account_id', user.id).not('listing_price', 'is', null)
    if (property_ids?.length > 0) {
      query = query.in('id', property_ids)
    }
    const { data: properties, error: propError } = await query.limit(1000)

    if (propError || !properties?.length) throw new Error('No properties found')

    // DELETE OLD ANALYSIS TO PREVENT DUPLICATES
    await supabaseClient.from('property_analysis').delete().eq('account_id', user.id)

    console.log(`📊 Analyzing ${properties.length} properties with 3-level structure`)

    const analyses = []

    for (const property of properties) {
      const analysis = analyzeProperty(property)

      // Save to property_analysis table with ALL new columns
      await supabaseClient.from('property_analysis').insert({
        property_id: property.id,
        account_id: user.id,
        reasoning: analysis.reasoning,
        recommendation: analysis.recommended_reason,
        strategy: analysis.strategy,
        win_win_score: analysis.win_win_score,
        max_score: 100,
        offer_price: analysis.offer_price,
        offer_percent: analysis.offer_percent,

        // Level 1 columns
        level1_offer_price: analysis.level1_offer_price,
        level1_entry_fee: analysis.level1_entry_fee,
        level1_monthly_payment: analysis.level1_monthly_payment,
        level1_cash_to_seller: analysis.level1_cash_to_seller,
        level1_seller_carry_amount: analysis.level1_seller_carry_amount,
        level1_seller_carry_rate: analysis.level1_seller_carry_rate,
        level1_seller_carry_term: analysis.level1_seller_carry_term,

        // Level 2 columns
        level2_offer_price: analysis.level2_offer_price,
        level2_entry_fee: analysis.level2_entry_fee,
        level2_cash_to_seller: analysis.level2_cash_to_seller,

        // Level 3 columns
        level3_offer_price: analysis.level3_offer_price,
        level3_entry_fee: analysis.level3_entry_fee,
        level3_monthly_payment: analysis.level3_monthly_payment,
        level3_assume_mortgage: analysis.level3_assume_mortgage,
        level3_seller_carry_amount: analysis.level3_seller_carry_amount,
        level3_seller_carry_rate: analysis.level3_seller_carry_rate,
        level3_seller_carry_term: analysis.level3_seller_carry_term,
        level3_cash_to_seller: analysis.level3_cash_to_seller,

        // Recommendation
        recommended_level: analysis.recommended_level,
        recommended_reason: analysis.recommended_reason,

        // Comps
        comps_count: 0,
        comps_avg_price: 0,
        comps_data: null
      })

      analyses.push(analysis)
      console.log(`✅ ${property.address}: Level ${analysis.recommended_level} recommended | Score: ${analysis.win_win_score}`)
    }

    return new Response(JSON.stringify({
      success: true,
      analyses,
      total_analyzed: analyses.length,
      message: `3-level underwriting complete. Level 1: ${analyses.filter(a => a.recommended_level === 1).length}, Level 2: ${analyses.filter(a => a.recommended_level === 2).length}, Level 3: ${analyses.filter(a => a.recommended_level === 3).length}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error: any) {
    console.error('❌ Underwriting error:', error)
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    })
  }
})
