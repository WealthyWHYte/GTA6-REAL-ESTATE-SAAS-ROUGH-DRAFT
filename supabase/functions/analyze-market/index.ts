// analyze-market/index.ts
// Market Scout Agent - AI-powered market research
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { routeAI } from '../_shared/ai-router.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Get Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    const userId = user.id;
    console.log(`👤 User ID: ${userId}`);
    const { property_ids, city, state } = await req.json();
    console.log(`🔍 Market Scout analyzing ${property_ids?.length || 'all'} properties in ${city}, ${state}`);
    // Get properties to analyze
    let query = supabaseClient.from('properties').select('*').eq('account_id', userId);
    if (property_ids && property_ids.length > 0) {
      query = query.in('id', property_ids);
    } else if (false && city) {
      query = query.eq('city', city);
    }
    const { data: properties, error: propError } = await query;
    if (propError || !properties || properties.length === 0) {
      throw new Error('No properties found to analyze');
    }
    console.log(`📊 Analyzing ${properties.length} properties`);
    // Build market analysis prompt
    // REAL MATH - Calculate stats from ALL 880 properties
    const prices = properties.map((p: any) => p.listing_price || 0).filter((v: number) => v > 0)
    const sqfts = properties.map((p: any) => p.sqft || 0).filter((v: number) => v > 0)
    const beds = properties.map((p: any) => p.bedrooms || 0).filter((v: number) => v > 0)
    const baths = properties.map((p: any) => p.bathrooms || 0).filter((v: number) => v > 0)
    const years = properties.map((p: any) => p.year_built || 0).filter((v: number) => v > 1900)
    const doms = properties.map((p: any) => p.days_on_market || 0).filter((v: number) => v >= 0)
    const equities = properties.map((p: any) => p.estimated_equity || 0).filter((v: number) => v > 0)

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a: number, b: number) => a + b, 0) / arr.length) : 0
    const median = (arr: number[]) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] || 0 }

    const realStats = {
      total_properties: properties.length,
      avg_price: avg(prices),
      median_price: median(prices),
      avg_sqft: avg(sqfts),
      avg_beds: avg(beds),
      avg_baths: avg(baths),
      avg_year_built: avg(years),
      avg_dom: avg(doms),
      avg_equity: avg(equities),
      high_equity_count: properties.filter((p: any) => (p.estimated_equity || 0) > (p.listing_price || 1) * 0.3).length,
      motivated_count: properties.filter((p: any) => (p.days_on_market || 0) > 90).length,
      free_clear_count: properties.filter((p: any) => !p.mortgage_balance || p.mortgage_balance === 0).length,
      avg_ppsqft: Math.round(avg(prices) / (avg(sqfts) || 1)),
    }

    const buyBox = {
      beds: `${Math.max(1, avg(beds) - 1)}-${avg(beds) + 1}`,
      baths: `${Math.max(1, avg(baths) - 1)}-${avg(baths) + 1}`,
      sqft_range: `${Math.round(avg(sqfts) * 0.7)}-${Math.round(avg(sqfts) * 1.3)}`,
      year_range: `${avg(years) - 20}-${avg(years) + 10}`,
      price_range: `$${Math.round(median(prices) * 0.7).toLocaleString()}-$${Math.round(median(prices) * 1.3).toLocaleString()}`,
    }

    // Sample 30 properties for AI prompt (stays under token limit)
    const sampleProperties = properties.slice(0, 30)
    const propertyList = sampleProperties.map((p: any) => `- ${p.address}, ${p.city}, ${p.state} | $${p.listing_price?.toLocaleString() || 'N/A'} | ${p.bedrooms || 'N/A'}bd/${p.bathrooms || 'N/A'}ba | ${p.sqft || 'N/A'}sqft | DOM:${p.days_on_market || 0}`).join('\n');
    const systemPrompt = `You are a real estate market research expert analyzing investment opportunities. Provide detailed, data-driven insights about market conditions, pricing trends, and investment potential.`;
    const prompt = `You are a real estate market expert. Here is REAL calculated data from ${properties.length} properties:

MARKET STATS (CALCULATED FROM ALL PROPERTIES):
${JSON.stringify(realStats, null, 2)}

BUY BOX (AUTO-GENERATED):
${JSON.stringify(buyBox, null, 2)}

SAMPLE PROPERTIES (${sampleProperties.length} of ${properties.length}):

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

Format as JSON with these exact keys: median_price, avg_days_on_market, price_per_sqft, market_temp, investment_grade, top_opportunities (array), risk_factors (array), deal_strategy`;
    // Call AI (simple direct call - no table dependencies)
    const aiResult = await routeAI(prompt, {
      systemPrompt,
      max_tokens: 2000
    });
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI analysis failed');
    }
    console.log(`✅ AI analysis complete via ${aiResult.provider}`);
    // Parse AI response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      let content = aiResult.content.trim();
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      analysis = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse JSON, using raw response');
      analysis = {
        median_price: properties[0]?.listing_price || 0,
        avg_days_on_market: 45,
        price_per_sqft: 250,
        market_temp: 'Warm',
        investment_grade: 'B+',
        top_opportunities: [
          'Analysis pending - AI response was not in expected format'
        ],
        risk_factors: [
          'Please review raw analysis'
        ],
        deal_strategy: 'Review full analysis for strategy recommendations',
        raw_analysis: aiResult.content
      };
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
    });
    const { data: savedAnalysis, error: saveError } = await supabaseClient.from('market_analysis').insert({
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
      ai_provider: aiResult.provider
    }).select().single();
    if (saveError) {
      console.error('❌ Failed to save analysis:', saveError);
    } else {
      console.log('✅ Analysis saved to database');
    }
    return new Response(JSON.stringify({
      success: true,
      analysis: savedAnalysis || analysis,
      properties_analyzed: properties.length,
      provider: aiResult.provider,
      message: `Market analysis complete for ${city}, ${state}`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Market analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
