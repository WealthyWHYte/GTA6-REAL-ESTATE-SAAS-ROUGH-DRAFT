// gmail-oauth-handler - Handles Gmail OAuth flow
// Users click "Connect Gmail" in Settings, this handles the callback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { encode } from "https://deno.land/std@0.208.0/encoding/base64.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Generate OAuth URL for user to click
function getGmailOAuthUrl(state: string): string {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID")
  const redirectUri = Deno.env.get("GMAIL_REDIRECT_URI") || "https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/gmail-oauth-handler"
  
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
  ].join(" ")

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",  // Get refresh token
    prompt: "consent",
    state: state
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

// Exchange auth code for tokens
async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string,
  refresh_token: string,
  expires_in: number
}> {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID")
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET")
  const redirectUri = Deno.env.get("GMAIL_REDIRECT_URI") || "https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/gmail-oauth-handler"

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId || "",
      client_secret: clientSecret || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return await response.json()
}

// Get user email from Gmail API
async function getGmailAddress(accessToken: string): Promise<string> {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  
  const data = await response.json()
  return data.emailAddress
}

serve(async (req) => {
  const url = new URL(req.url)
  const action = url.searchParams.get("action")
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // ACTION 1: Get OAuth URL (frontend calls this to get the URL to open)
    if (action === "get_url") {
      const { account_id } = await req.json()
      
      // Create a state token that includes account_id
      const state = encodeURIComponent(JSON.stringify({ account_id }))
      const oauthUrl = getGmailOAuthUrl(state)
      
      return new Response(JSON.stringify({ url: oauthUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // ACTION 2: Handle OAuth callback (Google redirects here)
    if (action === "callback") {
      const code = url.searchParams.get("code")
      const state = url.searchParams.get("state")
      
      if (!code) {
        return new Response(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h2>❌ Authentication Failed</h2>
              <p>No authorization code received.</p>
              <a href="/settings">Go back to Settings</a>
            </body>
          </html>
        `, { headers: { "Content-Type": "text/html" } })
      }

      // Decode state to get account_id
      let accountId = ""
      try {
        const stateObj = JSON.parse(decodeURIComponent(state || "{}"))
        accountId = stateObj.account_id
      } catch (e) {
        console.error("Failed to parse state:", e)
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code)
      
      // Get user's Gmail address
      const gmailAddress = await getGmailAddress(tokens.access_token)

      // If we have account_id, save to database
      if (accountId) {
        // Check if config exists
        const { data: existing } = await supabase
          .from("user_api_config")
          .select("account_id")
          .eq("account_id", accountId)
          .single()

        if (existing) {
          // Update existing
          await supabase
            .from("user_api_config")
            .update({
              gmail_refresh_token: tokens.refresh_token,
              gmail_email: gmailAddress,
              gmail_status: "connected",
              gmail_connected_at: new Date().toISOString()
            })
            .eq("account_id", accountId)
        } else {
          // Insert new
          await supabase
            .from("user_api_config")
            .insert({
              account_id: accountId,
              gmail_refresh_token: tokens.refresh_token,
              gmail_email: gmailAddress,
              gmail_status: "connected",
              gmail_connected_at: new Date().toISOString()
            })
        }
      }

      // Show success page
      return new Response(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>✅ Gmail Connected!</h2>
            <p>Account: ${gmailAddress}</p>
            <p>You can now receive and respond to listing agent replies automatically.</p>
            <br/>
            <a href="/settings" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Settings</a>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html" } })
    }

    // ACTION 3: Disconnect Gmail
    if (action === "disconnect") {
      const { account_id } = await req.json()
      
      await supabase
        .from("user_api_config")
        .update({
          gmail_refresh_token: null,
          gmail_email: null,
          gmail_status: "disconnected",
          gmail_connected_at: null
        })
        .eq("account_id", account_id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Gmail OAuth error:", error)
    return new Response(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>❌ Error</h2>
          <p>${error.message}</p>
          <a href="/settings">Go back to Settings</a>
        </body>
      </html>
    `, { status: 500, headers: { "Content-Type": "text/html" } })
  }
})