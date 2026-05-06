// cron-scheduler/index.ts
// Scheduled task: Check Gmail for replies, generate AI drafts, queue for approval
// Call this every 5 minutes from cron-job.org

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { KNOWLEDGE_BASE } from '../_shared/knowledge-base.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OBJECTION_PATTERNS = {
  price_too_low: ['too low', 'low ball', 'insulting', 'offensive', 'not serious', 'less than'],
  not_interested: ['not interested', 'not looking', 'already sold', 'decided', 'no longer'],
  timing: ['right now', 'timing', 'later', 'waiting', 'future', 'not ready'],
  financing: ['financing', 'loan', 'mortgage', 'credit', 'funding', 'approve'],
  multiple_offers: ['multiple', 'other offer', 'another', 'competing', 'better'],
  condition: ['condition', 'inspection', 'repair', 'as-is', 'renovation'],
}

function detectObjectionType(emailBody: string): string {
  const body = emailBody.toLowerCase()
  for (const [type, patterns] of Object.entries(OBJECTION_PATTERNS)) {
    if (patterns.some(p => body.includes(p))) return type
  }
  return 'interested' // Default to interested if no objection detected
}

function generateResponseDraft(
  propertyAddress: string,
  objectionType: string,
  sellerName: string
): { subject: string; body: string } {
  const handlers = KNOWLEDGE_BASE.objectionHandlers || {}
  
  switch (objectionType) {
    case 'price_too_low':
      return {
        subject: `Re: ${propertyAddress} - Let's Find a Solution That Works`,
        body: `Hi ${sellerName},\n\nI completely understand your perspective - you want fair market value and I want a win-win solution.\n\nThe reason my offer is structured this way: I'm offering ${KNOWLEDGE_BASE.yourTerms.yourOffer.downPayment} down and ${KNOWLEDGE_BASE.yourTerms.yourOffer.terms} terms - terms banks simply can't match.\n\nHere's what I can offer:\n\nOPTION A: Instead of lowering my price, I can increase your down payment to ${KNOWLEDGE_BASE.yourTerms.yourOffer.downPayment} - you get cash now.\n\nOPTION B: I can close in ${KNOWLEDGE_BASE.yourTerms.yourOffer.closingTime} with creative financing that puts money in your pocket monthly.\n\nLet's talk numbers - I'm flexible and want to make this work for both of us.\n\nBest,\nWealthanaire Capital`
      }
    
    case 'timing':
      return {
        subject: `Re: ${propertyAddress} - No Pressure`,
        body: `Hi ${sellerName},\n\nI completely understand timing is everything. The good news is there's no rush on my end.\n\nHere's what I can offer:\n- Close when you're ready (${KNOWLEDGE_BASE.yourTerms.yourOffer.closingTime} timeline)\n- Flexible terms that work with your situation\n- No pressure - I'm happy to wait 30, 60, even 90 days if needed\n\nWhen the time is right for you, I'll be ready with a fair offer and fast closing.\n\nBest,\nWealthanaire Capital`
      }
    
    case 'financing':
      return {
        subject: `Re: ${propertyAddress} - Flexible Financing Options`,
        body: `Hi ${sellerName},\n\nGreat question on financing. That's actually my specialty - I offer creative solutions that banks can't match:\n\n✓ ${KNOWLEDGE_BASE.yourTerms.yourOffer.downPayment} down payment (vs bank's 20-30%)\n✓ ${KNOWLEDGE_BASE.yourTerms.yourOffer.interestRate} interest rate (vs bank's 7-9%)\n✓ ${KNOWLEDGE_BASE.yourTerms.yourOffer.term} terms\n✓ Flexible requirements - I work with any credit situation\n\nNo bank loan needed. I have private funding available.\n\nLet's discuss what's best for your situation.\n\nBest,\nWealthanaire Capital`
      }
    
    case 'multiple_offers':
      return {
        subject: `Re: ${propertyAddress} - My Offer Stands`,
        body: `Hi ${sellerName},\n\nI understand you have options - that's actually good for you.\n\nWhat I can tell you:\n- My offer is solid and guaranteed - no financing contingencies\n- I can close in ${KNOWLEDGE_BASE.yourTerms.yourOffer.closingTime} - faster than bank financing\n- I'm pre-approved and ready to close immediately\n- No other properties I'm looking at - you're my priority\n\nIf your other deal falls through, I'm here and ready.\n\nBest,\nWealthanaire Capital`
      }
    
    default: // interested
      return {
        subject: `Re: ${propertyAddress} - Next Steps`,
        body: `Hi ${sellerName},\n\nThank you for your interest! I'm happy to answer any questions and walk you through the process.\n\nHere's a quick overview of how creative financing works:\n- Down payment: ${KNOWLEDGE_BASE.yourTerms.yourOffer.downPayment}\n- Interest rate: ${KNOWLEDGE_BASE.yourTerms.yourOffer.interestRate}\n- Terms: ${KNOWLEDGE_BASE.yourTerms.yourOffer.term}\n- Close in: ${KNOWLEDGE_BASE.yourTerms.yourOffer.closingTime}\n\nLet's schedule a call to discuss the details.\n\nBest,\nWealthanaire Capital`
      }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Cron started, using service role key')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let draftsCreated = 0

    console.log('📡 Supabase client created, querying user_api_config...')

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Try to get user from auth header, or use service role for system-wide scan
    let userId: string | null = null
    try {
      const { data: { user } } = await authClient.auth.getUser()
      userId = user?.id || null
    } catch (e) {
      // If no auth, we'll scan all users' gmail accounts
    }

    console.log('🔄 Cron scheduler running - checking for Gmail replies for goldenwaffle86@gmail.com')

    // Target specific account_id directly
    const TARGET_ACCOUNT_ID = '757a0f4a-49cd-43b3-b6c2-70274f611039'

    // Get Gmail token for this account
    // First try DB, then fallback to env var
    let refreshToken = ''

    const { data: account, error: fetchError } = await supabase
      .from('user_api_config')
      .select('gmail_refresh_token, gmail_access_token, gmail_token_expiry, gmail_email')
      .eq('account_id', TARGET_ACCOUNT_ID)
      .single()

    console.log('Fetched account config:', JSON.stringify(account), 'Error:', fetchError)

    // Check if token is expired or missing - refresh if needed
    let accessToken = account?.gmail_access_token || ''
    const tokenExpiry = account?.gmail_token_expiry ? new Date(account.gmail_token_expiry) : null
    const now = new Date()
    const isTokenExpired = !tokenExpiry || tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000  // Refresh 5 min before expiry

    if (account?.gmail_refresh_token) {
      refreshToken = account.gmail_refresh_token
      
      // If token missing or expired, refresh it
      if (isTokenExpired || !accessToken) {
        console.log('⏳ Token expired or missing, refreshing from Google...')
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: Deno.env.get('GMAIL_CLIENT_ID')!,
            client_secret: Deno.env.get('GMAIL_CLIENT_SECRET')!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        })

        if (!tokenResponse.ok) {
          console.log('❌ Failed to refresh Gmail token')
          return new Response(JSON.stringify({ success: false, error: 'Token refresh failed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const tokens = await tokenResponse.json()
        accessToken = tokens.access_token
        const expiresIn = tokens.expires_in || 3600
        const newExpiry = new Date(now.getTime() + expiresIn * 1000).toISOString()

        // Update DB with new access token and expiry
        await supabase
          .from('user_api_config')
          .update({
            gmail_access_token: accessToken,
            gmail_token_expiry: newExpiry
          })
          .eq('account_id', TARGET_ACCOUNT_ID)

        console.log('✅ Refreshed access token, expires at:', newExpiry)
      } else {
        console.log('✅ Using cached access token, expires at:', tokenExpiry)
      }
    } else {
      // Fallback to env var
      refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN') || ''
      console.log('⚠️ No DB refresh token, trying env var GMAIL_REFRESH_TOKEN')
    }

    if (!refreshToken) {
      console.log('❌ No Gmail refresh token found (DB or env)')
      return new Response(JSON.stringify({
        success: false,
        error: 'No Gmail token configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!accessToken) {
      console.log('❌ No access token available')
      return new Response(JSON.stringify({ success: false, error: 'No access token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Got access token, checking Gmail for', account?.gmail_email)
      const gmailResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=subject:(offer OR purchase OR creative OR financing OR real estate)&',
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )

      if (!gmailResponse.ok) {
        console.log(`⚠️ Gmail API error: ${gmailResponse.status}`)
        return new Response(JSON.stringify({ success: false, error: `Gmail API error: ${gmailResponse.status}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const gmailData = await gmailResponse.json()
      const messages = gmailData.messages || []

      for (const msg of messages) {
        // Get full message
        const msgDetail = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        )

        if (!msgDetail.ok) continue
        const msgData = await msgDetail.json()

        // Extract email content
        const headers = msgData.payload?.headers || []
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
        const from = headers.find((h: any) => h.name === 'From')?.value || ''
        const date = headers.find((h: any) => h.name === 'Date')?.value || ''

        // Get email body
        let body = ''
        if (msgData.payload?.body?.data) {
          body = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        } else if (msgData.payload?.parts) {
          for (const part of msgData.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
              break
            }
          }
        }

        // Skip if no email body or already processed
        if (!body || !body.trim()) continue

        // Check if already in communications (inbound)
        const { data: existing } = await supabase
          .from('communications')
          .select('id')
          .eq('gmail_message_id', msg.id)
          .single()

        if (existing) continue // Already processed

        // Detect objection type and generate draft
        const objectionType = detectObjectionType(body)
        const sellerName = from.split('<')[0].replace(/"/g, '').trim() || 'Seller'
        
        const draft = generateResponseDraft('Property', objectionType, sellerName)

        // Store as pending approval (match actual schema columns)
        await supabase.from('communications').insert({
          account_id: TARGET_ACCOUNT_ID,
          property_id: null,
          to_email: from.match(/<([^>]+)>/)?.[1] || from,
          to_name: sellerName,
          subject: draft.subject,
          body: draft.body,
          email_type: `ai_draft`,
          direction: 'outbound',
          status: 'pending_approval',
          gmail_message_id: msg.id,
          created_at: new Date().toISOString()
        })

        draftsCreated++
        console.log(`📝 Created draft for ${sellerName}: ${objectionType}`)
      }

      // Update last sync time
      await supabase
        .from('user_api_config')
        .update({ gmail_connected_at: new Date().toISOString() })
        .eq('account_id', TARGET_ACCOUNT_ID)

    return new Response(JSON.stringify({
      success: true,
      message: `Checked Gmail for goldenwaffle86@gmail.com, created ${draftsCreated} drafts`,
      draftsCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Cron scheduler error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})