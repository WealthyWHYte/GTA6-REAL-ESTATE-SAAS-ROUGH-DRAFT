// generate-email-response/index.ts
// Email Response Agent - AI-powered response to seller objections
// Detects objection type and generates personalized counter-response

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  OBJECTION_HANDLERS,
  detectObjectionType,
  calculateCounter,
  domUrgencyScore,
  carryingCostPerDay,
  sellerNetBenefit
} from '../_shared/knowledge-base.ts'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'http://localhost:11434'
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'llama3.2'

// Get user's API config
async function getUserConfig(supabase: any, accountId: string) {
  const { data } = await supabase
    .from("user_api_config")
    .select("*")
    .eq("account_id", accountId)
    .single()
  return data
}

// Call Ollama (FREE)
async function callOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false
      })
    })
    
    const data = await response.json()
    return data.response || ""
  } catch (error) {
    console.error("Ollama error:", error)
    throw error
  }
}

// Call OpenRouter (PRO)
async function callOpenRouter(prompt: string, apiKey: string, model: string = "anthropic/claude-3-haiku"): Promise<string> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://aiwealthanaire.com",
        "X-Title": "AIWealthanaire"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }]
      })
    })
    
    const data = await response.json()
    return data.choices?.[0]?.message?.content || data.error?.message || ""
  } catch (error) {
    console.error("OpenRouter error:", error)
    throw error
  }
}

// Main AI call - tries Ollama first, falls back to OpenRouter
async function routeAI(prompt: string, config?: any): Promise<string> {
  let result = ""
  
  // Try Ollama first (free)
  try {
    result = await callOllama(prompt)
    if (result.length > 10) {
      console.log("✅ Response from Ollama")
      return result
    }
  } catch (e) {
    console.log("⚠️ Ollama unavailable, trying OpenRouter...")
  }
  
  // Fall back to OpenRouter
  if (config?.openrouter_api_key) {
    result = await callOpenRouter(prompt, config.openrouter_api_key, config.model)
    console.log("✅ Response from OpenRouter")
    return result
  }
  
  throw new Error("No AI provider available")
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

    // Get request body
    const {
      property_id,
      inbound_email_body,
      seller_name,
      property_data
    } = await req.json()

    console.log(`📧 Generating response for property ${property_id}`)
    console.log(`📝 Email body: ${inbound_email_body?.substring(0, 100)}...`)

    // Get property data if not provided
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

    // Get user's API config
    const userConfig = await getUserConfig(supabaseClient, user.id)

    // Detect objection type
    const objectionType = detectObjectionType(inbound_email_body || '')
    const handler = OBJECTION_HANDLERS[objectionType] || OBJECTION_HANDLERS['price_too_low']
    
    console.log(`🎯 Detected objection type: ${objectionType}`)

    // Calculate dynamic values
    const askingPrice = property.listing_price || property.price || 0
    const dom = property.days_on_market || 30
    const equityPercent = property.estimated_equity && property.estimated_value 
      ? (property.estimated_equity / property.estimated_value) * 100 
      : 40
    
    // Calculate counter-offer (use Level 1, 2, or 3 based on objection)
    const negotiationLevel = objectionType === 'want_full_price' ? 3 : 1
    const counter = calculateCounter(askingPrice, dom, equityPercent, negotiationLevel)
    
    // DOM urgency
    const urgencyScore = domUrgencyScore(dom)
    
    // Carrying costs
    const dailyCost = carryingCostPerDay(askingPrice)
    const monthlyCarryingCost = dailyCost * 30
    
    // Seller net benefit
    const netBenefit = sellerNetBenefit(
      askingPrice,
      counter.offerPrice,
      property.open_mortgage_balance > 0 ? 'hybrid' : 'seller-finance',
      property.open_mortgage_balance || 0
    )

    // Build the prompt for AI
    const systemPrompt = `You are an expert real estate negotiator writing personalized email responses to sellers. Your tone is:
- Never desperate, always confident and calm
- Lead with empathy, pivot to logic  
- Always include one specific number from the data provided
- End with a soft close question, never a hard ask
- Max 150 words — short emails get read

DATA PROVIDED:
- Property: ${property.address}, ${property.city}, ${property.state}
- Asking Price: $${askingPrice.toLocaleString()}
- Days on Market: ${dom} (urgency score: ${urgencyScore}/30)
- Equity: ${equityPercent.toFixed(0)}%
- Counter Offer: $${counter.offerPrice.toLocaleString()} (${(counter.offerPrice/askingPrice*100).toFixed(0)}% of asking)
- Monthly Payment: $${counter.monthlyPayment.toLocaleString()}/mo
- Interest Rate: ${counter.rate}%
- Daily Carrying Cost: $${dailyCost.toLocaleString()}
- Monthly Carrying Cost: $${monthlyCarryingCost.toLocaleString()}
- Seller Net Benefit: ${netBenefit.summary}

OBJECTION TYPE: ${objectionType}
RECOMMENDED STRUCTURE: ${handler.structure}
TONE: ${handler.tone}

Write a response that addresses their specific concern with empathy, uses the numbers above, and ends with a question.`

    const prompt = `${systemPrompt}

SELLER'S EMAIL:
${inbound_email_body}

Write the response now. Subject line first on its own line, then a blank line, then the email body.`

    // Call AI
    const aiResponse = await routeAI(prompt, userConfig)

    // Parse subject and body
    const lines = aiResponse.trim().split('\n')
    let subject = 'Re: Your Property'
    let body = aiResponse

    // Try to extract subject
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i] && lines[i].length < 80 && !lines[i].startsWith('Hi') && !lines[i].startsWith('Hello')) {
        subject = lines[i].replace(/^Subject:?\s*/i, '').trim()
        body = lines.slice(i + 1).join('\n').trim()
        break
      }
    }

    // Save to communications table
    const { data: savedEmail, error: saveError } = await supabaseClient
      .from('communications')
      .insert({
        account_id: user.id,
        to_email: property.agent_email || property.seller_email || 'unknown@example.com',
        to_name: seller_name || property.seller_name || 'Property Owner',
        subject,
        message: body,
        category: 'objection_response',
        direction: 'outgoing',
        sentiment: 'neutral',
        comm_type: 'response',
        status: 'draft',
        ai_generated: true,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save email:', saveError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: { subject, body },
        objectionType,
        counterOffer: counter.offerPrice,
        reasoning: counter.reasoning,
        message: 'Response generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('❌ Response generation error:', error)
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