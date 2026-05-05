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

    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL') || 'aiwealthanaire@gmail.com'

    console.log(`📧 Sending to ${recipient_email}: ${subject}`)
    console.log(`🔍 Validating property_id: ${property_id}`)

    const messageId = await sendGmail(recipient_email, subject, body, fromEmail)

    // Resolve property_id to the correct format (TEXT, not UUID)
    let validPropertyId: string | null = null
    if (property_id) {
      // Check if it's a UUID (properties.id) or TEXT (properties.property_id)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property_id)

      if (isUUID) {
        // Lookup the TEXT property_id from the UUID id
        const { data: property, error: propError } = await supabase
          .from('properties')
          .select('property_id')
          .eq('id', property_id)
          .single()

        if (propError) {
          console.error('⚠️ Could not find property by UUID:', propError.message)
        } else if (property) {
          validPropertyId = property.property_id
          console.log(`✅ Converted UUID to property_id: ${validPropertyId}`)
        }
      } else {
        // Already TEXT format, validate it exists
        const { data: property, error: propError } = await supabase
          .from('properties')
          .select('property_id')
          .eq('property_id', property_id)
          .single()

        if (propError) {
          console.error('⚠️ Could not find property by property_id:', propError.message)
        } else if (property) {
          validPropertyId = property_id
          console.log(`✅ Property validated: ${property_id}`)
        }
      }
    }

    // Log to communications table (accepts either format)
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

    // MARK PROPERTY AS CONTACTED - this removes it from Underwriter queue automatically
    if (validPropertyId) {
      const now = new Date().toISOString()
      await supabase
        .from('property_analysis')
        .update({ 
          contacted_at: now,
          contact_count: supabase.raw('COALESCE(contact_count, 0) + 1')
        })
        .eq('property_id', validPropertyId)
        .eq('account_id', user.id)
      console.log(`✅ Property marked as contacted: ${validPropertyId} at ${now}`)
    }

    // Create/update offer record for dashboard tracking (requires TEXT property_id)
    if (validPropertyId) {
      const { data: existingOffer } = await supabase
        .from('offers')
        .select('id, offer_id')
        .eq('property_id', validPropertyId)
        .eq('account_id', user.id)
        .maybeSingle()

      if (existingOffer) {
        // Update existing offer
        console.log(`📝 Updating existing offer: ${existingOffer.offer_id}`)
        await supabase
          .from('offers')
          .update({
            status: 'pending_response',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOffer.id)

        // Create follow-ups for existing offer (if not already exist)
        const { data: existingFollowUps } = await supabase
          .from('follow_up_queue')
          .select('id')
          .eq('property_id', validPropertyId)
          .eq('offer_id', existingOffer.offer_id)

        if (!existingFollowUps?.length) {
          // AUTO-CREATE FOLLOW-UP QUEUE ENTRIES
          const now = new Date()
          const day3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
          const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

          await supabase.from('follow_up_queue').insert([
            {
              property_id: validPropertyId,
              offer_id: existingOffer.offer_id,
              follow_up_type: 'follow_up_1',
              scheduled_for: day3.toISOString(),
              status: 'pending',
              notes: 'Auto-generated: First follow-up (Day 3)'
            },
            {
              property_id: validPropertyId,
              offer_id: existingOffer.offer_id,
              follow_up_type: 'follow_up_2',
              scheduled_for: day7.toISOString(),
              status: 'pending',
              notes: 'Auto-generated: Second follow-up (Day 7)'
            }
          ])
          console.log(`📅 Created follow-up queue entries for existing offer`)
        }
      } else {
        // Create new offer record - get next offer number
        const { count } = await supabase
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', user.id)

        const offerNumber = (count || 0) + 1
        console.log(`➕ Creating new offer #${offerNumber}`)

        await supabase.from('offers').insert({
          offer_id: `OFFER-${offerNumber}`,
          account_id: user.id,
          property_id: validPropertyId,
          offer_price: 0,
          status: 'pending_response',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })

        // AUTO-CREATE FOLLOW-UP QUEUE ENTRIES
        const now = new Date()
        const day3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        await supabase.from('follow_up_queue').insert([
          {
            property_id: validPropertyId,
            offer_id: `OFFER-${offerNumber}`,
            follow_up_type: 'follow_up_1',
            scheduled_for: day3.toISOString(),
            status: 'pending',
            notes: 'Auto-generated: First follow-up (Day 3)'
          },
          {
            property_id: validPropertyId,
            offer_id: `OFFER-${offerNumber}`,
            follow_up_type: 'follow_up_2',
            scheduled_for: day7.toISOString(),
            status: 'pending',
            notes: 'Auto-generated: Second follow-up (Day 7)'
          }
        ])
        console.log(`📅 Created follow-up queue entries for new offer`)
      }
    } else {
      console.log('⚠️ No valid property_id - skipping offer creation')
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
