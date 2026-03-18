// dispo-match/index.ts
// Matches properties to buyers based on criteria
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { action, property_id, buyer_ids } = await req.json()

    console.log(`📋 Dispo Match: ${action} for property ${property_id}`)

    switch (action) {
      case 'find_matches': {
        // Get property details
        const { data: property, error: propError } = await supabaseClient
          .from('properties')
          .select('*')
          .eq('id', property_id)
          .single()

        if (propError || !property) {
          throw new Error('Property not found')
        }

        // Get all buyers for this account
        const { data: buyers, error: buyerError } = await supabaseClient
          .from('buyers')
          .select('*')
          .eq('account_id', user.id)
          .eq('status', 'active')

        if (buyerError || !buyers || buyers.length === 0) {
          return new Response(
            JSON.stringify({
              success: true,
              matches: [],
              message: 'No active buyers in your list'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Score each buyer against property
        const matches = buyers.map(buyer => {
          let score = 0
          const reasons: string[] = []

          // Price match
          if (property.listing_price >= (buyer.min_price || 0) && 
              property.listing_price <= (buyer.max_price || Infinity)) {
            score += 30
            reasons.push('Price within buyer range')
          }

          // Beds match
          if (property.bedrooms >= (buyer.min_beds || 0) && 
              property.bedrooms <= (buyer.max_beds || Infinity)) {
            score += 20
            reasons.push('Bedroom count fits')
          }

          // Sqft match
          if (property.sqft >= (buyer.min_sqft || 0) && 
              property.sqft <= (buyer.max_sqft || Infinity)) {
            score += 20
            reasons.push('Square footage fits')
          }

          // Location match
          if (buyer.preferred_locations && buyer.preferred_locations.length > 0) {
            const locationMatch = buyer.preferred_locations.some(
              (loc: string) => 
                property.city?.toLowerCase().includes(loc.toLowerCase()) ||
                property.state?.toLowerCase().includes(loc.toLowerCase())
            )
            if (locationMatch) {
              score += 30
              reasons.push('Location matches preference')
            }
          }

          return {
            buyer_id: buyer.id,
            buyer_name: buyer.name,
            buyer_email: buyer.email,
            match_score: score,
            match_reasons: reasons
          }
        })
        .filter(m => m.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)

        // Save matches to database
        for (const match of matches.slice(0, 5)) {
          await supabaseClient
            .from('property_buyer_matches')
            .upsert({
              account_id: user.id,
              property_id,
              buyer_id: match.buyer_id,
              match_score: match.match_score,
              match_reasons: match.match_reasons,
              status: 'pending'
            })
        }

        return new Response(
          JSON.stringify({
            success: true,
            matches,
            message: `Found ${matches.length} potential buyers`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'generate_buyer_email': {
        const { property_id, buyer_id } = await req.json()

        // Get property
        const { data: property } = await supabaseClient
          .from('properties')
          .select('*')
          .eq('id', property_id)
          .single()

        // Get buyer
        const { data: buyer } = await supabaseClient
          .from('buyers')
          .select('*')
          .eq('id', buyer_id)
          .single()

        if (!property || !buyer) {
          throw new Error('Property or buyer not found')
        }

        // Generate email to buyer
        const prompt = `Write an email to a real estate investor/buyer about a property opportunity.

BUYER: ${buyer.name}
EMAIL: ${buyer.email}
THEIR CRITERIA: Budget $${buyer.min_price?.toLocaleString()}-$${buyer.max_price?.toLocaleString()}, ${buyer.min_beds}+ beds, ${buyer.preferred_locations?.join(', ')}

PROPERTY: ${property.address}, ${property.city}, ${property.state}
LIST PRICE: $${property.listing_price?.toLocaleString() || 'TBD'}
BEDS: ${property.bedrooms} | BATHS: ${property.bathrooms} | SQFT: ${property.sqft}
ESTIMATED VALUE: $${property.estimated_value?.toLocaleString() || 'TBD'}
EQUITY: $${property.estimated_equity?.toLocaleString() || 'TBD'}

Write a compelling email that:
1. Hooks them with the opportunity
2. Highlights key property features matching their criteria
3. Shows the numbers (deal analysis)
4. Includes clear call to action
5. Is professional but urgent

Tone: Professional, urgent, data-driven
Length: 150-200 words
Subject: Catch their attention with property address or key metric`

        const aiResult = await routeAI(prompt, {
          systemPrompt: 'You are a real estate disposition specialist matching properties with investors.',
          max_tokens: 600
        })

        if (!aiResult.success) {
          throw new Error(aiResult.error || 'Failed to generate email')
        }

        // Parse and save email
        const content = aiResult.content.trim()
        const subjectMatch = content.match(/Subject:?\s*(.+?)[\n\r]/i)
        const subject = subjectMatch ? subjectMatch[1].trim() : `Investment Opportunity: ${property.address}`

        const { error: saveError } = await supabaseClient
          .from('communications')
          .insert({
            account_id: user.id,
            property_id,
            to_email: buyer.email,
            to_name: buyer.name,
            subject,
            message: content.replace(/Subject:.*[\n\r]/i, '').trim(),
            category: 'dispo_outreach',
            direction: 'outgoing',
            status: 'draft',
            ai_generated: true,
            ai_model: aiResult.model,
            ai_provider: aiResult.provider,
          })

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Buyer email generated',
            content: aiResult.content,
            provider: aiResult.provider
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error: any) {
    console.error('❌ Dispo match error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
