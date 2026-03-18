# ============================================
# DEPLOYMENT COMMANDS
# Run these in your terminal
# ============================================

# 1. DEPLOY EDGE FUNCTIONS
cd ~/Downloads/GTA\ 6\ Real\ Estate/gta-6-real-estate-saas-rough\ draft

# Deploy send-email (updated to use user's Gmail)
supabase functions deploy send-email

# Deploy other functions
supabase functions deploy gmail-oauth-handler
supabase functions deploy check-gmail-replies
supabase functions deploy generate-ai-reply

# 2. SET SECRETS (after you give me Client ID/Secret)
# You'll run these AFTER I set up Google OAuth
# supabase secrets set GMAIL_CLIENT_ID="your-client-id"
# supabase secrets set GMAIL_CLIENT_SECRET="your-client-secret"

# 3. ENABLE CRON JOB (in Supabase SQL Editor)
# Run this SQL:
"""
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'check-gmail-replies',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url:='https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/check-gmail-replies',
    headers:='{"Content-Type": "application/json"}'::jsonb
  )$$);
"""

# 4. ADD EMAIL TEMPLATES (in Supabase SQL Editor)
# Copy the SQL from: supabase/migrations/email_templates_simple.sql

# 5. BUILD FRONTEND
npm run build

# 6. DEPLOY FRONTEND (Vercel)
vercel deploy --prod

# ============================================
# WHAT I NEED FROM YOU:
# ============================================
# 1. Gmail OAuth Client ID
# 2. Gmail OAuth Client Secret
# 3. OpenRouter API Key (for AI responses)
