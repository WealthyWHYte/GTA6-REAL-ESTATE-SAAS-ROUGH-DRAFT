// generate-offer Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { property_id, account_id } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: property, error: propertyError } = await supabase.from('properties').select('*').eq('property_id', property_id).single()
    if (propertyError) throw propertyError

    const offerId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { data: offer, error: offerError } = await supabase.from('offers').insert({ offer_id: offerId, property_id, account_id, offer_price: property.offer_price, terms: property.offer_terms || {}, status: 'generated' }).select().single()
    if (offerError) throw offerError

    await supabase.from('properties').update({ pipeline_status: 'offer_sent', offer_sent: true, offer_date: new Date().toISOString().split('T')[0], offer_id: offerId, updated_at: new Date().toISOString() }).eq('property_id', property_id)

    if (property.agent_email) {
      await supabase.functions.invoke('send-email', { body: { property_id, offer_id: offerId, recipient_email: property.agent_email, recipient_name: property.agent_name, offer_type: 'initial_offer' } })
    }

    return new Response(JSON.stringify({ success: true, offer_id: offerId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
