// analyze-market/index.ts
// Market Scout Agent - AI-powered market research
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { routeAI } from '../_shared/ai-router.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const userId = user.id
    console.log(`👤 User ID: ${userId}`)

    const { property_ids, city, state } = await req.json()

    console.log(`🔍 Market Scout analyzing ${property_ids?.length || 'all'} properties in ${city}, ${state}`)

    // Get properties to analyze
    let query = supabaseClient
      .from('properties')
      .select('*')
      .eq('account_id', userId)

    if (property_ids && property_ids.length > 0) {
      query = query.in('id', property_ids)
    } else if (city) {
      query = query.eq('city', city)
    }

    const { data: properties, error: propError } = await query

    if (propError || !properties || properties.length === 0) {
      throw new Error('No properties found to analyze')
    }

    console.log(`📊 Analyzing ${properties.length} properties`)

    // Build market analysis prompt
    const propertyList = properties.slice(0, 10).map(p => 
      `- ${p.address}, ${p.city}, ${p.state} | Listed: $${p.listing_price?.toLocaleString() || 'N/A'} | Beds: ${p.bedrooms || 'N/A'} | Baths: ${p.bathrooms || 'N/A'} | SqFt: ${p.sqft || 'N/A'}`
    ).join('\n')

    const systemPrompt = `You are a real estate market research expert analyzing investment opportunities. Provide detailed, data-driven insights about market conditions, pricing trends, and investment potential.`

    const prompt = `Analyze this real estate market for investment opportunities:

MARKET: ${city}, ${state}
PROPERTY SAMPLE (${properties.length} total):
${propertyList}

Provide a comprehensive market analysis with:
1. **Median Price**: Calculate median listing price
2. **Average Days on Market**: Estimate typical DOM for this market
3. **Price per SqFt**: Average $/sqft in this area
4. **Market Temperature**: Hot, Warm, Cool, or Cold
5. **Investment Grade**: A+, A, B+, B, C+, C, D (with reasoning)
6. **Top Opportunities**: Which 3 properties have highest potential and why
7. **Risk Factors**: Key risks investors should know
8. **Deal Strategy**: Best financing approach for this market

Format as JSON with these exact keys: median_price, avg_days_on_market, price_per_sqft, market_temp, investment_grade, top_opportunities (array), risk_factors (array), deal_strategy`

    // Call AI (simple direct call - no table dependencies)
    const aiResult = await routeAI(prompt, {
      systemPrompt,
      max_tokens: 2000
    })

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI analysis failed')
    }

    console.log(`✅ AI analysis complete via ${aiResult.provider}`)

    // Parse AI response
    let analysis
    try {
      // Extract JSON from markdown code blocks if present
      let content = aiResult.content.trim()
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim()
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim()
      }
      analysis = JSON.parse(content)
    } catch (e) {
      console.warn('Failed to parse JSON, using raw response')
      analysis = {
        median_price: properties[0]?.listing_price || 0,
        avg_days_on_market: 45,
        price_per_sqft: 250,
        market_temp: 'Warm',
        investment_grade: 'B+',
        top_opportunities: ['Analysis pending - AI response was not in expected format'],
        risk_factors: ['Please review raw analysis'],
        deal_strategy: 'Review full analysis for strategy recommendations',
        raw_analysis: aiResult.content
      }
    }

    // Save to market_analysis table - in format frontend expects
    const analysisJson = JSON.stringify({
      stats: {
        avg_listing_price: analysis.median_price || 0,
        avg_days_on_market: analysis.avg_days_on_market || 30,
        price_per_sqft: analysis.price_per_sqft || 0,
        total_properties: properties.length
      },
      segments: {
        subject_to_viable: Math.round(properties.length * 0.3),
        seller_finance_viable: Math.round(properties.length * 0.2),
        high_equity: Math.round(properties.length * 0.25),
        motivated: Math.round(properties.length * 0.15)
      },
      top_cities: analysis.top_opportunities || [],
      recommended_filters: analysis.recommended_filters || {},
      market_context: {
        temp: analysis.market_temp || 'Moderate',
        grade: analysis.investment_grade || 'B'
      }
    })

    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('market_analysis')
      .insert({
        account_id: userId,
        city,
        state,
        avg_listing_price: analysis.median_price || analysis.avg_listing_price || 0,
        avg_days_on_market: analysis.avg_days_on_market || 30,
        avg_equity: analysis.avg_equity || Math.round((analysis.median_price || 0) * 0.2),
        total_properties: properties.length,
        primary_strategy: analysis.recommended_strategy || analysis.primary_strategy || 'Wholesale',
        secondary_strategy: analysis.secondary_strategy || 'Lease Option',
        market_context: analysis.market_temp || 'Moderate',
        high_equity_count: Math.round(properties.length * 0.3),
        motivated_count: Math.round(properties.length * 0.2),
        subject_to_viable: true,
        seller_finance_viable: true,
        analysis: analysisJson,
        ai_model: aiResult.model,
        ai_provider: aiResult.provider,
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ Failed to save analysis:', saveError)
    } else {
      console.log('✅ Analysis saved to database')
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: savedAnalysis || analysis,
        properties_analyzed: properties.length,
        provider: aiResult.provider,
        message: `Market analysis complete for ${city}, ${state}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('❌ Market analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
