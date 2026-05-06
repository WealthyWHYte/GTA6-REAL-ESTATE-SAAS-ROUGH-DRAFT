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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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

    console.log('🔄 Cron scheduler running - checking for Gmail replies...')

    // Get all users with Gmail connected (if no user specified)
    let usersWithGmail: any[] = []
    
    if (userId) {
      usersWithGmail = [{ account_id: userId }]
    } else {
      // Debug: first check what's in the table
      const { data: allConfig, error: debugError } = await supabase
        .from('user_api_config')
        .select('account_id, gmail_status, gmail_refresh_token')
      
      console.log('📊 All user_api_config records:', JSON.stringify(allConfig))
      console.log('📊 Debug error:', debugError)
      
      const { data, error: gmailError } = await supabase
        .from('user_api_config')
        .select('account_id')
        .eq('gmail_status', 'connected')
        .not('gmail_refresh_token', 'is', null)
      
      if (gmailError) {
        console.log('❌ user_api_config query error:', gmailError.message)
        console.log('Full error:', JSON.stringify(gmailError))
      }
      
      usersWithGmail = Array.isArray(data) ? data : []
      console.log('📬 Found', usersWithGmail.length, 'users with Gmail')
    }

    let processedCount = 0
    let draftsCreated = 0

    for (const user of usersWithGmail) {
      const accountId = user.account_id
      
      // Get Gmail token for this user
      const { data: account } = await supabase
        .from('user_api_config')
        .select('*')
        .eq('account_id', accountId)
        .eq('gmail_status', 'connected')
        .single()

      if (!account?.gmail_refresh_token) {
        console.log(`⚠️ No Gmail token for user ${accountId}`)
        continue
      }

      const lastCheck = account.gmail_connected_at || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      // Use refresh token to get access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GMAIL_CLIENT_ID')!,
          client_secret: Deno.env.get('GMAIL_CLIENT_SECRET')!,
          refresh_token: account.gmail_refresh_token,
          grant_type: 'refresh_token'
        })
      })
      
      if (!tokenResponse.ok) {
        console.log('❌ Failed to refresh Gmail token')
        continue
      }
      
      const tokens = await tokenResponse.json()
      const accessToken = tokens.access_token

      // Fetch recent emails from Gmail
      const gmailResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=subject:(offer OR purchase OR creative OR financing OR real estate)&',
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )

      if (!gmailResponse.ok) {
        console.log(`⚠️ Gmail API error for user ${accountId}: ${gmailResponse.status}`)
        continue
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

        // Store as pending approval
        await supabase.from('communications').insert({
          account_id: accountId,
          property_id: null, // Would need to match by email
          direction: 'outbound',
          subject: draft.subject,
          message: draft.body,
          email_type: `draft_${objectionType}`,
          status: 'pending_approval',
          gmail_thread_id: msgData.threadId,
          gmail_message_id: msg.id,
          to_email: from.match(/<([^>]+)>/)?.[1] || from,
          to_name: sellerName,
          created_at: new Date().toISOString(),
          notes: `AI Draft - ${objectionType} detected from cron-scheduler`
        })

        draftsCreated++
        console.log(`📝 Created draft for ${sellerName}: ${objectionType}`)
      }

      // Update last sync time
      await supabase
        .from('user_api_config')
        .update({ gmail_connected_at: new Date().toISOString() })
        .eq('account_id', accountId)

      processedCount++
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedCount} users, created ${draftsCreated} drafts`,
      usersProcessed: processedCount,
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