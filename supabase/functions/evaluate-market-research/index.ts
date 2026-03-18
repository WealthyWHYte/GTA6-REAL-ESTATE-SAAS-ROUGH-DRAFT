// Market Research Evaluation Agent
// Evaluates Market Scout's research quality and provides critique

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Property {
  id: string
  address: string
  city: string
  state: string
  zip: string
  listing_price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  property_type: string
  year_built: number
}

interface ResearchData {
  comps: any[]
  arv_calculation: any
  rental_data: any[]
  market_trends: any
}

interface EvaluationResult {
  overall_score: number
  criteria_scores: {
    comps_accuracy: number
    arv_calculation: number
    market_context: number
    data_completeness: number
    actionability: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  additional_data_needed: string[]
  notes: string
}

// Evaluate research quality
function evaluateResearchQuality(
  property: Property, 
  research: ResearchData
): EvaluationResult {
  const scores = {
    comps_accuracy: 0,
    arv_calculation: 0,
    market_context: 0,
    data_completeness: 0,
    actionability: 0
  }
  
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []
  const additionalDataNeeded: string[] = []

  // 1. Evaluate Comps
  const comps = research.comps || []
  if (comps.length >= 5) {
    scores.comps_accuracy = 90
    strengths.push('Good number of comparable properties found')
  } else if (comps.length >= 3) {
    scores.comps_accuracy = 70
    recommendations.push('Add more comparable properties (aim for 5+)')
  } else if (comps.length >= 1) {
    scores.comps_accuracy = 50
    weaknesses.push('Limited comparable properties')
    additionalDataNeeded.push('More sold properties in the area')
  } else {
    scores.comps_accuracy = 0
    weaknesses.push('No comparable properties found')
    additionalDataNeeded.push('Sold properties from last 6 months')
  }

  // Check comp quality
  const relevantComps = comps.filter((c: any) => {
    const priceDiff = Math.abs((c.price || c.listing_price || 0) - property.listing_price) / property.listing_price
    return priceDiff < 0.3 // Within 30%
  })
  
  if (relevantComps.length >= 3) {
    scores.comps_accuracy = Math.min(100, scores.comps_accuracy + 10)
    strengths.push('Comps are price-relevant')
  } else {
    weaknesses.push('Comps not price-appropriate')
  }

  // 2. Evaluate ARV Calculation
  const arv = research.arv_calculation
  if (arv && arv.arv) {
    const arvValue = parseFloat(arv.arv)
    const listPrice = property.listing_price
    
    if (arvValue > 0) {
      scores.arv_calculation = 80
      strengths.push(`ARV calculated: $${arvValue.toLocaleString()}`)
      
      // Check ARV vs List Price
      const arvToList = arvValue / listPrice
      if (arvToList >= 1.1) {
        strengths.push('ARV higher than list price - potential profit')
      } else if (arvToList >= 0.9) {
        recommendations.push('ARV close to list price - verify with more comps')
      } else {
        weaknesses.push('ARV lower than list price - may need price reduction')
      }
    }
    
    if (arv.methodology) {
      scores.arv_calculation += 10
      strengths.push('ARV methodology documented')
    }
  } else {
    scores.arv_calculation = 0
    weaknesses.push('No ARV calculation found')
    additionalDataNeeded.push('After Repair Value calculation')
  }

  // 3. Evaluate Market Context
  const trends = research.market_trends
  if (trends && Object.keys(trends).length > 0) {
    scores.market_context = 70
    strengths.push('Market trends data included')
  } else {
    scores.market_context = 20
    weaknesses.push('No market trends analysis')
    additionalDataNeeded.push('Market trends (days on market, price trends)')
  }

  // 4. Evaluate Data Completeness
  let completenessCount = 0
  if (comps.length > 0) completenessCount++
  if (arv && arv.arv) completenessCount++
  if ((research.rental_data || []).length > 0) completenessCount++
  if (trends && Object.keys(trends).length > 0) completenessCount++
  
  scores.data_completeness = completenessCount * 20

  // 5. Evaluate Actionability
  // Can we make an offer based on this?
  if (scores.comps_accuracy >= 60 && scores.arv_calculation >= 60) {
    scores.actionability = 80
    strengths.push('Enough data to formulate offer')
  } else if (scores.comps_accuracy >= 40 || scores.arv_calculation >= 40) {
    scores.actionability = 50
    recommendations.push('Need more research before making offer')
  } else {
    scores.actionability = 10
    weaknesses.push('Insufficient data for decision')
  }

  // Calculate overall score
  const overallScore = Math.round(
    (scores.comps_accuracy * 0.25) +
    (scores.arv_calculation * 0.25) +
    (scores.market_context * 0.15) +
    (scores.data_completeness * 0.20) +
    (scores.actionability * 0.15)
  )

  // Generate notes
  let notes = `Research quality score: ${overallScore}/100. `
  if (overallScore >= 80) {
    notes += 'Excellent research - ready for underwriting. '
  } else if (overallScore >= 60) {
    notes += 'Good research with minor gaps. '
  } else if (overallScore >= 40) {
    notes += 'Adequate but needs improvement. '
  } else {
    notes += 'Insufficient research - needs more data before underwriting. '
  }

  return {
    overall_score: overallScore,
    criteria_scores: scores,
    strengths,
    weaknesses,
    recommendations,
    additional_data_needed: additionalDataNeeded,
    notes
  }
}

// Generate data recommendations based on gaps
function recommendAdditionalData(
  property: Property,
  evaluation: EvaluationResult
): string[] {
  const recommendations: string[] = []

  if (evaluation.criteria_scores.comps_accuracy < 70) {
    recommendations.push(
      `Pull sold properties in ${property.city}, ${property.state} from last 6 months within 1-mile radius`
    )
    recommendations.push(
      `Find off-market properties with similar specs (${property.bedrooms}bd/${property.bathrooms}ba)`
    )
  }

  if (evaluation.criteria_scores.arv_calculation < 70) {
    recommendations.push(
      'Get MLS comparables with renovation details'
    )
    recommendations.push(
      'Find tax assessor values for subject property'
    )
  }

  if (evaluation.criteria_scores.market_context < 60) {
    recommendations.push(
      `Research ${property.city} market trends - days on market, price per sqft trends`
    )
    recommendations.push(
      'Find neighborhood amenities and development plans'
    )
  }

  if (evaluation.criteria_scores.data_completeness < 60) {
    recommendations.push(
      'Rental comparables in the area'
    )
    recommendations.push(
      'Property tax history and assessed values'
    )
  }

  return recommendations
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { propertyId, property, research } = await req.json()
    
    console.log('🎯 Evaluating market research for:', property?.address || propertyId)

    if (!propertyId || !property || !research) {
      throw new Error('Missing propertyId, property, or research data')
    }

    // Evaluate the research
    const evaluation = evaluateResearchQuality(property, research)
    
    // Get additional data recommendations
    const dataRecommendations = recommendAdditionalData(property, evaluation)

    console.log('📊 Evaluation complete:', evaluation.overall_score, '/100')

    // Store evaluation in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store research result
    const { data: researchResult, error: researchError } = await supabase
      .from('market_research_results')
      .insert({
        property_id: propertyId,
        comps: research.comps,
        arv_calculation: research.arv_calculation,
        rental_data: research.rental_data,
        market_trends: research.market_trends,
        research_quality_score: evaluation.overall_score,
        comp_relevance_score: evaluation.criteria_scores.comps_accuracy,
        arv_accuracy_score: evaluation.criteria_scores.arv_calculation,
        market_understanding_score: evaluation.criteria_scores.market_context,
        data_gaps: evaluation.weaknesses,
        evaluation_notes: evaluation.notes,
        status: 'evaluated',
        evaluated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (researchError) {
      console.error('Failed to store research result:', researchError)
    }

    // Store detailed evaluation
    const { data: evaluationRecord, error: evalError } = await supabase
      .from('research_evaluations')
      .insert({
        property_id: propertyId,
        research_result_id: researchResult?.id,
        criteria_1_comps_accuracy: evaluation.criteria_scores.comps_accuracy,
        criteria_2_arv_calculation: evaluation.criteria_scores.arv_calculation,
        criteria_3_market_context: evaluation.criteria_scores.market_context,
        criteria_4_data_completeness: evaluation.criteria_scores.data_completeness,
        criteria_5_actionability: evaluation.criteria_scores.actionability,
        overall_score: evaluation.overall_score,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        recommendations: evaluation.recommendations,
        additional_data_needed: dataRecommendations,
        evaluator_notes: evaluation.notes
      })
      .select()
      .single()

    if (evalError) {
      console.error('Failed to store evaluation:', evalError)
    }

    return new Response(JSON.stringify({
      success: true,
      evaluation: evaluation,
      data_recommendations: dataRecommendations,
      research_result_id: researchResult?.id,
      evaluation_id: evaluationRecord?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Evaluation error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
