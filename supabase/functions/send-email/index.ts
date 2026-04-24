import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID')!
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')!
  const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN')!

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })
  const data = await resp.json()
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data))
  return data.access_token
}

async function sendGmail(to: string, subject: string, body: string, fromEmail: string): Promise<string> {
  const accessToken = await getAccessToken()

  const email = [
    `From: Wealthanaire Capital <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    body
  ].join('\r\n')

  const encoded = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  })

  const result = await resp.json()
  if (!resp.ok) throw new Error('Gmail send failed: ' + JSON.stringify(result))
  console.log('✅ Email sent via Gmail, messageId:', result.id)
  return result.id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

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
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { recipient_email, recipient_name, subject, body, property_id } = await req.json()

    if (!recipient_email) throw new Error('recipient_email required')
    if (!subject) throw new Error('subject required')
    if (!body) throw new Error('body required')

    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL') || 'me'

    console.log(`📧 Sending to ${recipient_email}: ${subject}`)

    const messageId = await sendGmail(recipient_email, subject, body, fromEmail)

    // Log to communications table
    await supabase.from('communications').insert({
      account_id: user.id,
      property_id: property_id || null,
      to_email: recipient_email,
      to_name: recipient_name || '',
      subject,
      message: body,
      direction: 'outgoing',
      status: 'sent',
      gmail_message_id: messageId,
      sent_at: new Date().toISOString()
    })

    // Create/update offer record for dashboard tracking
    if (property_id) {
      const { data: existingOffer } = await supabase
        .from('offers')
        .select('id')
        .eq('property_id', property_id)
        .eq('account_id', user.id)
        .single()

      if (existingOffer) {
        // Update existing offer
        await supabase
          .from('offers')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            gmail_message_id: messageId
          })
          .eq('id', existingOffer.id)
      } else {
        // Create new offer record
        await supabase.from('offers').insert({
          account_id: user.id,
          property_id: property_id,
          status: 'sent',
          sent_at: new Date().toISOString(),
          gmail_message_id: messageId
        })
      }
    }

    return new Response(JSON.stringify({ success: true, messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Send email error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    })
  }
})
