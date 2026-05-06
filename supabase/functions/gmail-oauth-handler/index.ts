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
  const urlAction = url.searchParams.get("action")
  
  // Support action in URL or in request body
  let action = urlAction
  let body: any = {}
  
  console.log('Request:', req.method, 'URL:', req.url, 'content-type:', req.headers.get("content-type"))
  
  // Parse body content - handle both POST and GET requests
  const contentType = req.headers.get("content-type") || ""
  const method = req.method || "GET"
  
  // Try to parse body for any method (some clients put body in GET)
  try {
    const text = await req.text()
    console.log('Raw request body:', text)
    if (text) {
      try {
        body = JSON.parse(text)
        action = action || body.action
        console.log('Parsed body, action from body:', body.action, 'urlAction:', urlAction)
      } catch {
        // Not JSON, try URLSearchParams
        const params = new URLSearchParams(text)
        action = action || params.get("action")
        body.action = action
        console.log('Parsed as URLSearchParams, action:', action)
      }
    }
  } catch (e) {
    console.log('Body read error:', e)
  }
  
  if (method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // Debug: log what action we got
  console.log('Final action before fallback:', action, 'body:', JSON.stringify(body))
  console.log('URL searchParams:', url.searchParams.toString())
  
  // Fallback: detect callback from URL params (Google sends code, state)
  if (!action) {
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    if (code || state) {
      action = "callback"
      console.log('Detected callback from URL params, code present:', !!code)
    }
  }
  
  // Fallback: if body has action but wasn't captured, use it
  if (!action && body && body.action) {
    action = body.action
    console.log('Used fallback action from body:', action)
  }
  
  // If still no action but this is likely a function invocation, default to get_url
  if (!action && Object.keys(body).length > 0) {
    console.log('Defaulting to get_url since body present but no action')
    action = "get_url"
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // ACTION 1: Get OAuth URL (frontend calls this to get the URL to open)
    if (action === "get_url") {
      const account_id = body.account_id
      
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
      // FIX: Handle both plain UUID and JSON state
      let accountId = ""
      try {
        // Try double-decode first
        const stateStr = decodeURIComponent(decodeURIComponent(state || '{}'))
        console.log('Parsed state:', stateStr)
        const stateObj = JSON.parse(stateStr)
        accountId = stateObj.account_id
        console.log('account_id from state:', accountId)
      } catch (e) {
        // Fallback: plain UUID (no JSON wrapper)
        console.log("State parse failed, trying as plain UUID:", state)
        accountId = state || ""
        console.log('account_id from state (fallback):', accountId)
      }

      // Exchange code for tokens
      console.log('Exchanging code for tokens, accountId:', accountId)
      const tokens = await exchangeCodeForTokens(code)
      
      // Get user's Gmail address
      const gmailAddress = await getGmailAddress(tokens.access_token)
      console.log('Got Gmail address:', gmailAddress)
      
      // If we have account_id, save to database
      if (accountId) {
        console.log('Saving to user_api_config for account_id:', accountId)
        
        // Check if config exists
        const { data: existing } = await supabase
          .from("user_api_config")
          .select("account_id")
          .eq("account_id", accountId)
          .single()

        // Insert/update using EXISTING columns in user_api_config
        // Using gmail_email and gmail_app_password as temp storage for OAuth tokens
        const insertData = {
          account_id: accountId,
          gmail_email: gmailAddress,
          gmail_app_password: tokens.refresh_token  // Store refresh token here temporarily
        }
        console.log('Saving using existing columns:', JSON.stringify(insertData))

        if (existing) {
          // Update existing - only use existing columns
          await supabase
            .from("user_api_config")
            .update({
              gmail_email: gmailAddress,
              gmail_app_password: tokens.refresh_token
            })
            .eq("account_id", accountId)
        } else {
          // Insert new - only use existing columns
          await supabase
            .from("user_api_config")
            .insert({
              account_id: accountId,
              gmail_email: gmailAddress,
              gmail_app_password: tokens.refresh_token
            })
        }
        
        console.log('✅ Gmail OAuth saved successfully!')
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
      const account_id = body.account_id
      
      await supabase
        .from("user_api_config")
        .update({
          gmail_access_token: null,
          gmail_refresh_token: null,
          gmail_token_expiry: null,
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