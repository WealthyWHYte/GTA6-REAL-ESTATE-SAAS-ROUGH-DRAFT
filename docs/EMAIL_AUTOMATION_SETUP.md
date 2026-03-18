# 🚀 REAL-TIME EMAIL AUTOMATION SETUP GUIDE

This guide walks you through setting up instant email monitoring and AI-powered responses.

---

## STEP 1: Google Cloud Setup (Gmail API)

### 1.1 Create Google Cloud Project
1. Go to: **https://console.cloud.google.com/**
2. Create new project: `gta6-email-automation`
3. Enable Gmail API:
   - Search "Gmail API" → Enable it
   - Search "Pub/Sub API" → Enable it

### 1.2 Create OAuth Credentials
1. Go to: **APIs & Services → Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Desktop App**
4. Download the JSON file
5. Rename to: `credentials.json`

### 1.3 Configure Pub/Sub (for real-time notifications)
1. Go to: **Pub/Sub → Topics**
2. Create topic: `gmail-notifications`
3. Add your email as a **Pub/Sub Subscriber**
4. Grant "Gmail API" service account permission to publish:
   - Email: `gmail-api-push@system.gserviceaccount.com`

---

## STEP 2: Supabase Database Setup

Run this SQL in Supabase to create the email automation tables:

```sql
-- Email Credentials Storage
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  provider VARCHAR(50), -- 'gmail', 'outlook', 'smtp'
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  imap_host VARCHAR(255),
  imap_port INTEGER,
  imap_user VARCHAR(255),
  imap_pass VARCHAR(255),
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  gmail_token JSONB, -- OAuth tokens
  gmail_refresh_token VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Queue (for sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id UUID,
  to_email VARCHAR(255),
  to_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  template_used VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal', -- high, normal, low
  status VARCHAR(20) DEFAULT 'pending', -- pending, queued, sending, sent, failed
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  response_to_id UUID, -- links to incoming email
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Responses (incoming)
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id UUID,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  received_at TIMESTAMP,
  sentiment VARCHAR(50),
  confidence DECIMAL(5,2),
  key_phrases TEXT[],
  action_required VARCHAR(50),
  urgency VARCHAR(20),
  next_steps TEXT,
  ai_response_generated BOOLEAN DEFAULT false,
  human_reviewed BOOLEAN DEFAULT false,
  approved_for_send BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Response Delay Settings
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID UNIQUE,
  response_delay_min INTEGER DEFAULT 3, -- minimum delay in minutes
  response_delay_max INTEGER DEFAULT 9, -- maximum delay in minutes
  auto_send BOOLEAN DEFAULT false, -- true = auto, false = human review first
  ai_enabled BOOLEAN DEFAULT true,
  max_draft_variations INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "email_creds_own" ON email_credentials FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_queue_own" ON email_queue FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_responses_own" ON email_responses FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_settings_own" ON email_settings FOR ALL USING (account_id = auth.uid());

GRANT ALL ON email_credentials TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_responses TO service_role;
GRANT ALL ON email_settings TO service_role;
```

---

## STEP 3: Edge Function - Gmail Webhook Receiver

Create file: `supabase/functions/gmail-webhook/index.ts`

```typescript
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
```

---

## STEP 4: Edge Function - AI Email Response Generator

Create file: `supabase/functions/generate-email-response/index.ts`

This function:
1. Receives incoming email
2. Analyzes intent using AI
3. Pulls relevant property data
4. Generates contextual response
5. Queues with human-like delay

```typescript
// See full implementation in supabase/functions/generate-email-response/
```

---

## STEP 5: Human-in-the-Loop Review UI

Add to your app a new page for reviewing AI-generated responses before sending.

---

## 🚀 QUICK START (Without Gmail API)

If you want to test first without full Gmail API setup:

1. **Use IMAP polling** - Run a cron job every 5 minutes to check inbox
2. **Use SMTP sending** - Configure any email account

---

## 📋 SETUP CHECKLIST

| Step | Task | Status |
|------|------|--------|
| 1 | Create Google Cloud Project | ⬜ |
| 2 | Enable Gmail API | ⬜ |
| 3 | Create OAuth Credentials | ⬜ |
| 4 | Set up Pub/Sub topic | ⬜ |
| 5 | Run SQL in Supabase | ⬜ |
| 6 | Deploy Edge Functions | ⬜ |
| 7 | Test email flow | ⬜ |

---

## 🔧 Next Steps

Do you want me to:
1. **Deploy the Edge Functions** to Supabase?
2. **Create the email settings UI** in the app?
3. **Build the human review dashboard**?

Let me know which part to tackle first!
