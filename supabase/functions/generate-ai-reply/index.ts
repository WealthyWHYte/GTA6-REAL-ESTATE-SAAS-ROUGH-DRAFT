// generate-ai-reply - AI generates response to listing agent objections
// Uses dual tier: Ollama (free) or OpenRouter (pro)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aiwealthanaire.com",
        "X-Title": "GTA 6 Real Estate"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400
      })
    })
    
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ""
  } catch (error) {
    console.error("OpenRouter error:", error)
    throw error
  }
}

// Detect objection type from agent's reply
function detectObjection(reply: string): string {
  const lower = reply.toLowerCase()
  
  if (lower.includes("cash") || lower.includes("all cash") || lower.includes("cash only")) {
    return "wants_cash_only"
  }
  if (lower.includes("price") || lower.includes("too low") || lower.includes("lowball") || lower.includes("higher")) {
    return "price_too_low"
  }
  if (lower.includes("proof of funds") || lower.includes("pre-approval") || lower.includes("funds") || lower.includes("letter")) {
    return "needs_proof_funds"
  }
  if (lower.includes("never heard") || lower.includes("who are") || lower.includes("company") || lower.includes("credentials")) {
    return "credibility_question"
  }
  if (lower.includes("seller financing") || lower.includes("hold a note") || lower.includes("carry") || lower.includes("owner financing")) {
    return "seller_finance_concern"
  }
  if (lower.includes("subject") || lower.includes("mortgage") || lower.includes("loan") || lower.includes("due on sale")) {
    return "subject_to_concern"
  }
  if (lower.includes("time") || lower.includes("deadline") || lower.includes("soon") || lower.includes("quick")) {
    return "timing_issue"
  }
  if (lower.includes("repairs") || lower.includes("condition") || lower.includes("as-is") || lower.includes("fix") || lower.includes("renovate")) {
    return "condition_concern"
  }
  if (lower.includes("no thanks") || lower.includes("not interested") || lower.includes("not at this time")) {
    return "not_interested"
  }
  if (lower.includes("accepted") || lower.includes("went with") || lower.includes("another") || lower.includes("sold")) {
    return "deal_lost"
  }
  if (lower.includes("thank") || lower.includes("appreciate") || lower.includes("look") || lower.includes("consider")) {
    return "positive_interest"
  }
  
  return "general_objection"
}

// Get KB-8 response for objection type
function getKBResponse(objectionType: string): string {
  const responses: Record<string, string> = {
    wants_cash_only: `You are negotiating with a seller who wants cash only. 

Key points to address:
- Explain tax advantages of seller financing (installment sale treatment)
- They receive monthly income stream vs. one lump sum
- Higher net proceeds after taxes (avoid capital gains hit)
- No agent commission - they save 5-6%
- Secured by recorded mortgage - they're protected
- They can balloon or amortize based on preference`,

    price_too_low: `You are negotiating on price. 

Key points to address:
- Pivot from price to terms - offer full asking price but with creative financing
- Explain equity protection through recorded mortgage
- Seller retains title insurance until balloon payment
- Explain fair offer based on market data and condition
- Offer to split difference or meet in middle`,

    needs_proof_funds: `The agent is asking for proof of funds or pre-approval.

Key points to address:
- Offer to provide bank statement showing liquidity
- Share recent purchase examples (address, price, closed date)
- Provide business references
- Attorney letter confirming funds availability
- Explain your lending relationships`,

    credibility_question: `The agent is questioning your credibility.

Key points to address:
- Mention years in business and experience
- Number of deals closed
- Better Business Bureau rating
- References from attorneys/CPA
- Professional website and presence`,

    seller_finance_concern: `Seller is concerned about seller financing.

Key points to address:
- Explain servicing company handles all payments professionally
- Secured by recorded mortgage - they control the property
- Foreclosure rights if default - they're fully protected
- Balloon payment timeline (2-5 years)
- Explain due-on-sale clause is rarely enforced`,

    subject_to_concern: `Seller is concerned about Subject-To.

Key points to address:
- Existing loan stays in place - no new mortgage needed
- You assume payments immediately - no gap
- Seller relieved of monthly obligation immediately
- Due-on-sale clause is practically never enforced
- Explain your track record with this strategy`,

    timing_issue: `Seller has timing concerns.

Key points to address:
- Offer flexible closing timeline (7-45 days)
- Offer rent-back if they need time
- Quick earnest money deposit
- Attorney can handle closing remotely
- Work with their timeline`,

    condition_concern: `Seller is concerned about property condition.

Key points to address:
- Confirm property as-is - no repair requests
- No inspection objections - we buy as-is
- We handle any issues post-close
- No renegotiations based on inspection
- Quick close, no contingencies`,

    not_interested: `Seller is not interested.

Key points to address:
- Respect their decision
- Leave door open for future
- Offer to connect in 6 months when circumstances change
- Ask if they know anyone who might be interested
- Thank them for their time`,

    deal_lost: `Deal was lost to another buyer.

Key points to address:
- Congratulate them
- Ask for feedback on what won
- Stay in touch for future opportunities
- Ask for referrals to other investors`,

    positive_interest: `Seller shows positive interest.

Key points to address:
- Express enthusiasm to move forward
- Summarize key terms agreed
- Ask for next steps
- Offer to answer questions
- Move toward contract`,

    general_objection: `General objection - need to understand their true concern.

Key points to address:
- Ask clarifying questions
- Understand their specific concern
- Offer multiple solutions
- Keep dialogue open
- Don't be pushy`
  }
  
  return responses[objectionType] || responses.general_objection
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { thread_id, account_id, agent_reply } = await req.json()

    if (!thread_id || !agent_reply) {
      throw new Error("Missing thread_id or agent_reply")
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    console.log(`🤖 Generating AI reply for thread: ${thread_id}`)

    // Get thread details
    const { data: thread } = await supabase
      .from("email_threads")
      .select("*, properties(*)")
      .eq("thread_id", thread_id)
      .single()

    if (!thread) {
      throw new Error("Thread not found")
    }

    // Get user's API config
    const userConfig = account_id ? await getUserConfig(supabase, account_id) : null

    // Detect objection type
    const objectionType = detectObjection(agent_reply)
    console.log(`Detected objection type: ${objectionType}`)

    // Get KB guidance
    const kbResponse = getKBResponse(objectionType)

    // Build conversation history
    const conversationHistory = (thread.messages || [])
      .map((m: any) => `${m.from === 'us' ? 'YOU (Investor)' : 'LISTING AGENT/SELLER'}: ${m.content.substring(0, 500)}`)
      .join("\n\n---\n\n")

    // Build prompt
    const prompt = `You are an expert real estate investor negotiating via email. You are professional, persistent, and always look for win-win solutions.

PROPERTY DETAILS:
- Address: ${thread.property_address || 'N/A'}
- Listed Price: $${thread.properties?.listing_price?.toLocaleString() || 'N/A'}
- Your Offer: $${thread.offer_price?.toLocaleString() || 'N/A'}
- Strategy: ${thread.strategy || 'Creative Financing'}
- Equity: $${thread.properties?.estimated_equity?.toLocaleString() || 'N/A'}

CONVERSATION HISTORY:
${conversationHistory}

AGENT'S LATEST REPLY:
${agent_reply}

DETECTED OBJECTION TYPE: ${objectionType}

KNOWLEDGE BASE GUIDANCE (Objection Handling):
${kbResponse}

TASK: Generate a professional, persuasive response that:
1. Addresses their specific objection professionally
2. Emphasizes benefits to the seller
3. Keeps the negotiation moving forward
4. Is SHORT (100-150 words max - emails should be brief)
5. Has a clear call-to-action or next step

Write ONLY the email body - no subject line, no greeting like "Dear Agent". Start directly with the message.`

    // Call AI based on user's tier
    let aiResponse = ""
    let modelUsed = "ollama"
    let cost = 0

    const hasApiKey = userConfig?.openrouter_key && userConfig.openrouter_key.trim() !== ''

    if (hasApiKey) {
      // PRO tier - use OpenRouter
      const apiKey = userConfig.openrouter_key
      const model = userConfig?.model_preference || 'anthropic/claude-3-haiku'
      aiResponse = await callOpenRouter(prompt, apiKey, model)
      modelUsed = model
      cost = 0.010 // Approximate
    } else {
      // FREE tier - use Ollama
      aiResponse = await callOllama(prompt)
      modelUsed = "ollama"
      cost = 0
    }

    console.log(`AI response generated using ${modelUsed}:`, aiResponse.substring(0, 100))

    // Update thread with AI response
    const messages = thread.messages || []
    messages.push({
      from: "us",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      objection_addressed: objectionType,
      model_used: modelUsed
    })

    await supabase
      .from("email_threads")
      .update({
        messages,
        last_message_at: new Date().toISOString(),
        last_message_from: "us",
        our_emails: (thread.our_emails || 0) + 1,
        total_emails: (thread.total_emails || 0) + 1,
        detected_objections: [...(thread.detected_objections || []), objectionType],
        status: objectionType === "deal_lost" ? "lost" : objectionType === "positive_interest" ? "interested" : "negotiating"
      })
      .eq("thread_id", thread_id)

    // Send the email via send-email function
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          property_id: thread.property_id,
          recipient_email: thread.recipient_email,
          recipient_name: thread.recipient_name,
          offer_type: "counter_offer",
          custom_message: aiResponse,
          account_id: account_id,
          test_mode: false
        }
      })
      console.log("Email sent successfully")
    } catch (e) {
      console.error("Failed to send email:", e)
    }

    // Log usage
    if (account_id) {
      await supabase.from("api_usage_log").insert({
        account_id,
        function_name: "generate-ai-reply",
        model_used: modelUsed,
        tokens_used: 0,
        cost: cost
      })
    }

    return new Response(JSON.stringify({
      success: true,
      thread_id,
      ai_response: aiResponse,
      objection_type: objectionType,
      model_used: modelUsed,
      cost: cost
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Generate AI reply error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
