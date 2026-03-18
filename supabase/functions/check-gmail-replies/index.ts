// check-gmail-replies/index.ts
// Checks Gmail for new seller replies and generates AI responses
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

    // Get user's Gmail OAuth token
    const { data: account } = await supabaseClient
      .from('user_accounts')
      .select('*')
      .eq('account_id', user.id)
      .eq('provider', 'gmail')
      .single()

    if (!account?.access_token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Gmail not connected. Please connect Gmail in settings.',
          replies: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get last check time
    const lastCheck = account.last_sync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Fetch recent emails from Gmail API
    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      {
        headers: {
          'Authorization': `Bearer ${account.access_token}`,
        }
      }
    )

    if (!gmailResponse.ok) {
      // Token might be expired, try refresh
      if (gmailResponse.status === 401) {
        // Would need to implement token refresh here
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Gmail token expired. Please reconnect Gmail.',
            replies: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error('Failed to fetch Gmail')
    }

    const gmailData = await gmailResponse.json()
    const messages = gmailData.messages || []

    const newReplies: any[] = []

    // Process each message (limit to recent 10)
    for (const msg of messages.slice(0, 10)) {
      // Get full message details
      const msgDetail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
          }
        }
      )

      if (!msgDetail.ok) continue
      
      const msgData = await msgDetail.json()
      
      // Check if this is a reply to our email
      const headers = msgData.payload?.headers || []
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
      const from = headers.find((h: any) => h.name === 'From')?.value || ''
      const date = headers.find((h: any) => h.name === 'Date')?.value || ''

      // Skip if too old or not a reply
      const msgDate = new Date(date)
      if (msgDate < new Date(lastCheck)) continue
      if (!subject.toLowerCase().includes('re:') && !subject.toLowerCase().includes('responding')) continue

      // Get message body
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

      // Try to find matching property/communication
      const { data: existingComms } = await supabaseClient
        .from('communications')
        .select('*')
        .eq('account_id', user.id)
        .ilike('to_email', `%${from.split('<')[1]?.replace('>', '').trim() || ''}%`)

      const propertyId = existingComms?.[0]?.property_id

      newReplies.push({
        id: msg.id,
        from,
        subject,
        body: body.substring(0, 500),
        property_id: propertyId,
        date: msgDate.toISOString()
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        replies: newReplies,
        checked_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Gmail check error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
