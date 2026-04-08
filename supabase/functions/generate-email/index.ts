// generate-email/index.ts
// Email Closer Agent - AI-powered email writing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { routeAI } from '../_shared/ai-router.ts'
import { generateEmailPrompt } from '../_shared/knowledge-base.ts'

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

    const {
      property_id,
      email_type,
      property_data,
      seller_name,
      custom_message,
      previous_emails,
      level,
      offer_price,
      structure,
      entry_fee,
      monthly_payment
    } = await req.json()

    console.log(`📧 Email Closer generating ${email_type} email for property ${property_id}`)

    // Get property if not provided
    let property = property_data
    if (!property && property_id) {
      const { data: propData } = await supabaseClient
        .from('properties')
        .select('*')
        .eq('id', property_id)
        .single()
      property = propData
    }

    if (!property) {
      throw new Error('Property data required')
    }

    // Build email generation prompt based on type
    let systemPrompt = `You are an expert real estate negotiator writing emails to motivated sellers. Your emails are friendly, professional, and focus on solving the seller's problems. ALWAYS include bank comparison in your pitch.`
    
    // Get property analysis for negotiation level
    let analysisData = null
    const { data: analysis } = await supabaseClient
      .from('property_analysis')
      .select('*')
      .eq('property_id', property_id)
      .single()
    analysisData = analysis
    
    // Build context with negotiation strategy
    const negotiationContext = `
YOUR NEGOTIATION STRATEGY (in priority order):
- LEVEL 1 (BEST): 70% of asking + terms - This is your GOAL!
  - Banks want: 20-30% down, 7-9% rate, 30yr term
  - You offer: 0-10% down, 0-5% rate, 40-50yr term
- LEVEL 2: 70% cash (if they reject Level 1)
- LEVEL 3: 100% full price (last resort)

KEY COMPARISON TO BANKS:
| Feature | Banks | Our Offer |
|---------|-------|-----------|
| Down | 20-30% | 0-10% |
| Rate | 7-9% | 0-5% |
| Term | 30yr | 40-50yr |
| Close | 30-45 days | 14-30 days |

ALWAYS mention: "We beat bank terms on every metric!"
`
    
    let prompt = ''

    switch (email_type) {
      case 'initial_outreach':
        prompt = `Write a professional initial outreach email to a property seller.

PROPERTY: ${property.address}, ${property.city}, ${property.state}
SELLER: ${seller_name || 'Property Owner'}
LISTING PRICE: $${property.listing_price?.toLocaleString()}
DAYS ON MARKET: ${property.days_on_market || 'Unknown'}
${analysisData ? `STRATEGY: ${analysisData.strategy} (Win-Win Score: ${analysisData.win_win_score}/100)
AI ANALYSIS: ${analysisData.ai_analysis || ''}` : ''}

${negotiationContext}

Write in the style of Antwaun Maxwell, a private investor. Structure:

1. Opening: "Hi [Name], My name is Antwaun Maxwell — I'm a private investor actively acquiring properties in your area. I'd love to make an offer on your property at [address]."

2. Explain the offer approach: Subject-To + Seller Finance hybrid that benefits both parties

3. Compare to banks: "Banks want 20-30% down, we offer 0-10%. Banks charge 7-9% interest, we offer 0-5%. Banks require 30-year terms, we can go 40-50 years."

4. Fast closing: 14-30 days, EMD of 1% with title company

5. Call to action: Ask for mortgage statement and any counter terms

6. Sign-off with phone (3059683470) and confidentiality notice

Tone: Professional, direct, confident (not salesy or generic)
Length: 200-300 words
Subject line: Offer for [Property Address]`
        break

      case 'follow_up':
        prompt = `Write a follow-up email to a seller we contacted previously.

PROPERTY: ${property.address}, ${property.city}, ${property.state}
SELLER: ${seller_name || 'Property Owner'}
PREVIOUS CONTEXT: ${previous_emails || 'Sent initial outreach, no response yet'}
${analysisData ? `STRATEGY: ${analysisData.strategy}` : ''}

${negotiationContext}

Write a polite follow-up that:
1. References our previous email
2. Adds new value or angle
3. Shows continued interest
4. Makes it easy to respond
5. MENTIONS: How you beat bank terms

Tone: Persistent but respectful
Length: 100-150 words
Subject line: Include subject`
        break

      case 'objection_handler':
        prompt = `Write an email addressing a seller's objection or concern.

PROPERTY: ${property.address}, ${property.city}, ${property.state}
SELLER: ${seller_name || 'Property Owner'}
OBJECTION: ${custom_message || 'General price concerns'}
${analysisData ? `STRATEGY: ${analysisData.strategy}` : ''}

${negotiationContext}

Address their concern with:
1. Empathy and understanding
2. Clear, honest explanation
3. HOW YOUR TERMS BEAT BANKS
4. Alternative solutions
5. Path forward

Tone: Understanding, problem-solving
Length: 150-200 words
Subject line: Include subject`
        break

      case 'offer_presentation':
        // Use actual offer data passed from frontend
        const selectedOfferPrice = property_data.level1_offer_price || offer_price || property.listing_price * 0.7
        const selectedEntryFee = property_data.level1_entry_fee || entry_fee || selectedOfferPrice * 0.1
        const selectedMonthlyPayment = property_data.level1_monthly_payment || monthly_payment || 0
        const selectedCarryRate = property_data.level1_seller_carry_rate || 4
        const mortgageBalance = property_data.open_mortgage_balance || property.open_mortgage_balance || 0
        const sellerCarryAmount = selectedOfferPrice - mortgageBalance - selectedEntryFee

        prompt = `Write a professional offer presentation email to a property seller.

PROPERTY: ${property.address}, ${property.city}, ${property.state}
SELLER: ${seller_name || 'Property Owner'}
LISTING PRICE: $${property.listing_price?.toLocaleString()}
${analysisData ? `STRATEGY: ${analysisData.strategy} (Win-Win Score: ${analysisData.win_win_score}/100)
AI ANALYSIS: ${analysisData.ai_analysis || ''}` : ''}

OFFER DETAILS (use these exact numbers):
- Purchase Price: $${Math.round(selectedOfferPrice).toLocaleString()}
- Entry Fee (Cash to Seller at Closing): $${Math.round(selectedEntryFee).toLocaleString()}
- Existing Loan to Be Taken Over (Subject-To): $${Math.round(mortgageBalance).toLocaleString()}
- Seller Finance Note (7-Year Balloon): $${Math.round(sellerCarryAmount).toLocaleString()}
- Monthly Seller Financing Payment: $${Math.round(selectedMonthlyPayment).toLocaleString()}
- Interest Rate: ${selectedCarryRate}%

${negotiationContext}

Write in the style of Antwaun Maxwell, a serious private investor. Structure:

1. Opening: "Hi [Name], My name is Antwaun Maxwell — I'm a private investor actively acquiring properties in your area. I'd love to present an offer for your property at [address]."

2. Offer Summary section with the exact numbers above in a clean bulleted format

3. Key Details:
   • Closing in 30 days (or sooner if needed)
   • EMD of 1% placed with title company
   • Flexible terms to ensure a smooth and efficient closing

4. Call to action: "If the terms look good, please share a copy of the most recent mortgage statement along with any counter terms you'd like us to consider. Once terms are confirmed, we'll send over the formal contract."

5. Sign-off: "Happy to answer any questions or discuss further. Best regards, Antwaun Maxwell Phone: 3059683470"

6. Add confidentiality notice at bottom.

Tone: Professional, direct, numbers-focused (not salesy or generic)
Length: 250-350 words
Subject line: Offer for ${property.address} - $${Math.round(selectedOfferPrice).toLocaleString()}`
        break

      case 'closing':
        prompt = `Write a closing email to finalize the deal.

PROPERTY: ${property.address}, ${property.city}, ${property.state}
SELLER: ${seller_name || 'Property Owner'}
STATUS: Moving to contract

Write a closing email that:
1. Confirms next steps
2. Reassures them
3. Provides timeline
4. Shows excitement
5. Gives clear action items

Tone: Professional, reassuring, excited
Length: 100-150 words
Subject line: Include subject`
        break

      default:
        throw new Error('Invalid email type')
    }

    // Call AI
    const aiResult = await routeAI(prompt, {
      systemPrompt,
      max_tokens: 800
    })

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'Failed to generate email')
    }

    console.log(`✅ Email generated via ${aiResult.provider}`)

    // Parse subject and body from AI response
    const content = aiResult.content.trim()
    let subject = 'Re: Your Property'
    let body = content

    // Try to extract subject line
    const subjectMatch = content.match(/Subject:?\s*(.+?)[\n\r]/i)
    if (subjectMatch) {
      subject = subjectMatch[1].trim()
      body = content.replace(subjectMatch[0], '').trim()
    }

    // Save to communications table - using ACTUAL DB schema
    const { data: savedEmail, error: saveError } = await supabaseClient
      .from('communications')
      .insert({
        account_id: user.id,
        property_id: property_id,
        to_email: property.agent_email || property.seller_email || 'unknown@example.com',
        to_name: seller_name || property.seller_name || 'Property Owner',
        subject,
        message: body,
        category: email_type,
        direction: 'outgoing',
        sentiment: 'neutral',
        comm_type: email_type,
        status: 'draft',
        ai_generated: true,
        ai_model: aiResult.model,
        ai_provider: aiResult.provider,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save email:', saveError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: savedEmail || { subject, body },
        provider: aiResult.provider,
        message: 'Email generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('❌ Email generation error:', error)
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
