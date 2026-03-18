# 🎯 COMPLETE EXECUTION GUIDE - GTA 6 REAL ESTATE

## 📦 WHAT YOU HAVE

### Files Created:
| File | Purpose |
|------|---------|
| `n8n-workflows/ai-responder-v2.json` | Auto-reply to agent emails |
| `n8n-workflows/contract-generation.json` | Generate contracts from deals |
| `n8n-workflows/contract-approval.json` | Approve & send for signature |
| `supabase/migrations/contracts_table.sql` | Contract tracking table |
| `supabase/migrations/email_templates_simple.sql` | 5 email templates |
| `SETUP_GUIDE.md` | n8n setup instructions |

---

## 🚀 STEP-BY-EXECUTION

### PHASE 1: DATABASE (Do First)

```sql
-- Run in Supabase SQL Editor:

-- 1. Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  property_id UUID,
  contract_type TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'generated',
  agreed_price NUMERIC,
  down_payment NUMERIC,
  monthly_payment NUMERIC,
  interest_rate NUMERIC,
  term_years INTEGER,
  closing_date DATE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_status TEXT DEFAULT 'new';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS agreed_price NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_structure TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS closing_date DATE;

-- 3. Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 4. Add email templates (from file)
-- Copy content from: supabase/migrations/email_templates_simple.sql
```

### PHASE 2: SUPABASE FUNCTIONS

```bash
# Deploy updated functions
cd ~/Downloads/GTA\ 6\ Real\ Estate/gta-6-real-estate-saas-rough\ draft

supabase functions deploy send-email
supabase functions deploy gmail-oauth-handler
supabase functions deploy check-gmail-replies
supabase functions deploy generate-ai-reply
```

### PHASE 3: N8N WORKFLOWS

#### Workflow 1: Auto-Responder (Phase 3)
1. Open n8n: http://localhost:5678
2. Import: `n8n-workflows/ai-responder-v2.json`
3. Configure credentials:
   - Gmail OAuth
   - OpenRouter API key
   - Supabase API key
4. Activate workflow

#### Workflow 2: Contract Generation (Phase 5)
1. Import: `n8n-workflows/contract-generation.json`
2. Replace placeholders:
   - `YOUR_HTML2PDF_API_KEY` → Get from html2pdf.app (free tier)
   - `YOUR_SUPABASE_SERVICE_KEY` → Your service role key
   - `YOUR_EMAIL` → Your email
3. Activate workflow

#### Workflow 3: Contract Approval (Phase 6)
1. Import: `n8n-workflows/contract-approval.json`
2. Configure:
   - PandaDoc API key (or skip for email signatures)
   - Your email for notifications
3. Activate workflow

### PHASE 4: GOOGLE OAUTH (Required)

```
1. Go to: https://console.cloud.google.com
2. Create project: "AiWealthanaire"
3. Enable Gmail API
4. Create OAuth credentials:
   - Application type: Web application
   - Redirect URI: https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/gmail-oauth-callback
5. Get Client ID + Secret
6. Give to me to set as secrets
```

### PHASE 5: SET SECRETS

```bash
# After getting Google OAuth credentials:
supabase secrets set GMAIL_CLIENT_ID="your-client-id"
supabase secrets set GMAIL_CLIENT_SECRET="your-client-secret"
```

---

## 📊 THE COMPLETE WORKFLOW

```
PROPERTY UPLOAD (CSV)
        │
        ▼
┌───────────────────┐
│  LEAD SCORING    │ ──→ AI analyzes property
│  (Supabase)      │
└────────┬──────────┘
         │
         ▼ (score > 70)
┌───────────────────┐
│  EMAIL CAMPAIGN  │ ──→ Send LOI via Gmail
│  (Supabase)      │
└────────┬──────────┘
         │
         ▼
    AGENT REPLIES
         │
         ▼
┌───────────────────┐
│  AUTO-RESPONDER  │ ←─── n8n watches Gmail (every 5 min)
│  (n8n)           │      AI generates response
└────────┬──────────┘      Sends reply
         │
         ▼ (interested)
┌───────────────────┐
│  NEGOTIATION     │ ←─── AI continues thread
│  (n8n + Supabase)│      Tracks progress
└────────┬──────────┘
         │
         ▼ (terms agreed)
┌───────────────────┐
│  CONTRACT READY  │ ←─── Webhook triggers
│  (n8n)           │      Generate PDF
└────────┬──────────┘      Upload to Supabase
         │
         ▼ (you approve)
┌───────────────────┐
│  E-SIGNATURE     │ ←─── PandaDoc or Email
│  (n8n)           │      Send to agent
└────────┬──────────┘
         │
         ▼ (signed)
┌───────────────────┐
│  DEAL CLOSED     │ ←─── Update status
│  (n8n)            │      Notify you
└───────────────────┘
```

---

## 🎯 DEAL STATUS FLOW

```
new → scored → email_sent → negotiating → terms_agreed → contract_generated → 
contract_approved → sent_for_signature → signed → closed
```

---

## ⚡ QUICK COMMANDS

```bash
# Deploy all functions
supabase functions deploy send-email
supabase functions deploy gmail-oauth-handler
supabase functions deploy check-gmail-replies

# Check function logs
supabase functions logs send-email

# Test email
curl -X POST https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"property_id": "xxx", "test_mode": true}'
```

---

## 📋 WHAT YOU NEED TO PROVIDE

| Item | Status | Where to Get |
|------|--------|--------------|
| Gmail OAuth Client ID | ❌ Need from you | Google Cloud Console |
| Gmail OAuth Client Secret | ❌ Need from you | Google Cloud Console |
| OpenRouter API Key | ❓ Have you? | openrouter.ai |
| PandaDoc API Key | ⏸️ Optional | pandadoc.com |

---

## 🎬 READY?

1. **Run contracts SQL** in Supabase
2. **Set up n8n** with the 3 workflows
3. **Give me Google OAuth** credentials
4. **Send test emails**

Let's go! 🚀
