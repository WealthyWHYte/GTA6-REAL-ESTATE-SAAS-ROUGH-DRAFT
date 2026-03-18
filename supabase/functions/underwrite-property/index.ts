// underwrite-property Edge Function - AI-Powered Property Scoring
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS' 
}

const OPENROUTER_API_KEY = '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'

const STRATEGIES: Record<string, any> = { 
  long_term_rental: { name: 'Long Term Rental', minCoc: 12 }, 
  flip: { name: 'Fix and Flip', minArvDiscount: 0.70 }, 
  lease_option: { name: 'Lease Option', minCoc: 8 }, 
  subject_to: { name: 'Subject To', minCoc: 10 }, 
  brrrr: { name: 'BRRRR', minCoc: 15 }, 
  wholesale: { name: 'Wholesale', maxArvDiscount: 0.60 } 
}

// AI Property Scoring using OpenRouter
async function getAIPropertyScore(property: any, marketContext?: any): Promise<{
  totalScore: number,
  equityScore: number,
  motivationScore: number,
  priceScore: number,
  conditionScore: number,
  locationScore: number,
  recommendation: string,
  analysis: string,
  winWinScore: number,
  risks: string[],
  opportunities: string[]
}> {
  
  const prompt = `Score this real estate investment opportunity. Provide scores 0-100 for each category and a recommendation.

PROPERTY DATA:
- Address: ${property.address || 'N/A'}
- City: ${property.city || 'N/A'}, ${property.state || 'N/A'}
- Listing Price: $${(property.listing_price || 0).toLocaleString()}
- Estimated Value (ARV): $${(property.estimated_value || 0).toLocaleString()}
- Equity: $${(property.estimated_equity || 0).toLocaleString()} (${property.equity_percent || 0}%)
- Days on Market: ${property.days_on_market || 'N/A'}
- Mortgage Balance: $${(property.mortgage_balance || 0).toLocaleString()}
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Sq Ft: ${property.sqft || 'N/A'}
- Price/Sq Ft: ${property.listing_price && property.sqft ? Math.round(property.listing_price / property.sqft) : 'N/A'}

${marketContext ? `MARKET CONTEXT:
- ${marketContext.marketInsight || ''}
- ${marketContext.sellerMotivation || ''}
- Primary Strategy: ${marketContext.primary_strategy || 'N/A'}` : ''}

Scoring Criteria:
1. EQUITY SCORE: Higher equity % = better (30%+ is excellent, 20%+ is good, <10% is poor)
2. MOTIVATION SCORE: Higher DOM = more motivated seller (90+ days = highly motivated)
3. PRICE SCORE: Lower price/ARV = better deal (70% = great, 80% = good, 90%+ = poor)
4. CONDITION SCORE: Based on property type, sqft, bedrooms/bathrooms
5. LOCATION SCORE: Based on price relative to market

Return JSON with:
{
  "totalScore": number (0-100),
  "equityScore": number (0-100),
  "motivationScore": number (0-100), 
  "priceScore": number (0-100),
  "conditionScore": number (0-100),
  "locationScore": number (0-100),
  "recommendation": "STRONG_BUY|BUY|HOLD|PASS",
  "analysis": "2-3 sentence summary",
  "winWinScore": number (1-10, how fair to seller),
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aiwealthanaire.com',
        'X-Title': 'GTA 6 Real Estate'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800
      })
    })
    
    const data = await response.json()
    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message?.content || ''
      try {
        return JSON.parse(content)
      } catch {
        // Return default scores if parsing fails
        return getDefaultScores(property)
      }
    }
  } catch (error) {
    console.error('AI scoring failed:', error)
  }
  
  return getDefaultScores(property)
}

function getDefaultScores(property: any): any {
  const equityScore = Math.min(100, (property.equity_percent || 0) * 3)
  const motivationScore = Math.min(100, (property.days_on_market || 0))
  const ltv = property.listing_price && property.estimated_value ? property.listing_price / property.estimated_value : 1
  const priceScore = Math.max(0, 100 - (ltv * 100))
  
  return {
    totalScore: Math.round((equityScore + motivationScore + priceScore) / 3),
    equityScore: Math.round(equityScore),
    motivationScore: Math.round(motivationScore),
    priceScore: Math.round(priceScore),
    conditionScore: 70,
    locationScore: 70,
    recommendation: equityScore > 40 && motivationScore > 30 ? 'BUY' : 'HOLD',
    analysis: 'Based on equity and market timing.',
    winWinScore: 6,
    risks: ['Market conditions may change'],
    opportunities: ['Equity position provides cushion']
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { property_id, account_id, use_ai } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get property
    const { data: property, error: propertyError } = await supabase.from('properties').select('*').eq('property_id', property_id).single()
    if (propertyError) throw propertyError

    // Get market context if available
    const { data: marketAnalysis } = await supabase
      .from('market_analysis')
      .select('market_context, primary_strategy')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const marketContext = marketAnalysis?.market_context

    let aiScores: any = null
    
    // Use AI scoring if requested
    if (use_ai) {
      console.log('🤖 Getting AI property scores...')
      aiScores = await getAIPropertyScore(property, marketContext)
      console.log('🤖 AI Score:', aiScores.totalScore, aiScores.recommendation)
    }

    // Fallback to rule-based scoring
    const recommendedStrategy = determineOptimalStrategy(property)
    const offerTerms = generateOfferTerms(property, recommendedStrategy)
    const offerPrice = calculateOptimalOfferPrice(property, recommendedStrategy)

    // Calculate scores if not using AI
    const scores = aiScores || getDefaultScores(property)

    // Update property with underwriting results
    await supabase.from('properties').update({ 
      strategy_recommended: recommendedStrategy, 
      offer_terms: offerTerms, 
      offer_price: offerPrice, 
      pipeline_status: 'offer_generation',
      underwriting_scores: scores,
      updated_at: new Date().toISOString() 
    }).eq('property_id', property_id)

    // Save scores to property_scores table
    await supabase.from('property_scores').insert({
      property_id,
      account_id,
      total_score: scores.totalScore,
      equity_score: scores.equityScore,
      motivation_score: scores.motivationScore,
      price_score: scores.priceScore,
      condition_score: scores.conditionScore,
      location_score: scores.locationScore,
      recommended_strategy: recommendedStrategy,
      offer_price: offerPrice,
      max_offer_price: Math.round(offerPrice * 1.1),
      analysis_notes: scores.analysis
    })

    // Generate offer
    await supabase.functions.invoke('generate-offer', { body: { property_id, account_id, strategy: recommendedStrategy } })

    return new Response(JSON.stringify({ 
      success: true, 
      property_id, 
      recommendedStrategy, 
      offerPrice,
      scores,
      aiPowered: !!use_ai
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

function determineOptimalStrategy(property: any): string {
  const coc = property.cash_on_cash || 0
  const dscrVal = property.dscr || 0
  const ltv = property.listing_price && property.estimated_value ? property.listing_price / property.estimated_value : 1
  const equityPercent = property.equity_percent || 0
  
  // Score each strategy
  const scores: Record<string, number> = {}
  
  // Long Term Rental
  scores.long_term_rental = coc >= 12 && dscrVal >= 1.5 && ltv <= 0.75 ? 30 : 0
  
  // Fix & Flip
  scores.flip = ltv <= 0.70 ? 25 : 0
  
  // Lease Option  
  scores.lease_option = coc >= 8 && dscrVal >= 1.25 ? 28 : 0
  
  // Subject To (check if existing mortgage)
  scores.subject_to = (property.mortgage_balance || 0) > 0 && equityPercent >= 30 && (property.listing_price || 0) < 500000 ? 25 : 0
  
  // BRRRR
  scores.brrrr = coc >= 15 ? 26 : 0
  
  // Wholesale
  scores.wholesale = ltv <= 0.60 ? 30 : 0

  // Sort by score and return best
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : 'wholesale'
}

function generateOfferTerms(property: any, strategy: string): any {
  const base: any = { 
    strategy, 
    generated_at: new Date().toISOString(), 
    expiration_days: 5, 
    earnest_money: Math.round((property.listing_price || 0) * 0.01), 
    inspection_period: 10, 
    financing_type: 'conventional' 
  }
  
  if (strategy === 'flip') { 
    base.all_cash = true
    base.quick_closing = true
  }
  else if (strategy === 'lease_option') { 
    base.option_fee = 5000
    base.monthly_credit = 100
    base.lease_term = 24
    base.purchase_price_pct = 90
  }
  else if (strategy === 'subject_to') { 
    base.assume_mortgage = true
    base.cash_to_seller = 5000
  }
  else { 
    base.down_payment = 20
    base.interest_rate = 6
    base.loan_term = 30
  }
  
  return base
}

function calculateOptimalOfferPrice(property: any, strategy: string): number {
  const arv = property.estimated_value || property.listing_price || 0
  if (!arv) return property.listing_price || 0
  
  const rules: Record<string, number> = { 
    long_term_rental: 0.85, 
    flip: 0.70, 
    lease_option: 0.85, 
    subject_to: 0.90, 
    brrrr: 0.80, 
    wholesale: 0.60, 
    hold: 0.90 
  }
  
  const minDiscount = rules[strategy] || 0.90
  const targetPrice = Math.round(arv * minDiscount)
  const listingPrice = property.listing_price || 0
  
  // Use the lower of target price or listing price
  return listingPrice && listingPrice < targetPrice ? listingPrice : targetPrice
}
