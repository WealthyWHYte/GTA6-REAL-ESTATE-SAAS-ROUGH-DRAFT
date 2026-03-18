import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailAddress, historyId } = await req.json()
    
    console.log('📬 Gmail webhook received:', { emailAddress, historyId })
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Store webhook notification
    await supabase.from('activity_log').insert({
      agent_name: 'gmail-webhook',
      action: 'email_received',
      details: { emailAddress, historyId }
    })
    
    // Trigger email fetch process
    // In production, this would call another function to fetch and process the email
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook received' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})