# 🎯 COMPLETE SYSTEM WITH RISK ANALYSIS

## 🚨 POTENTIAL BLOCKERS & SOLUTIONS

### BLOCKER 1: Google OAuth Credentials
**Problem:** You need Client ID + Secret from Google Cloud
**Solution:** I'll guide you step-by-step below

### BLOCKER 2: n8n Can't Reach Supabase (Network)
**Problem:** n8n running locally, Supabase is cloud
**Solution:** Use ngrok or expose n8n to internet

### BLOCKER 3: Email Going to Spam
**Problem:** AI emails go to spam
**Solution:** Warm up Gmail, use proper SPF/DKIM

### BLOCKER 4: API Rate Limits
**Problem:** OpenRouter/Gmail API limits
**Solution:** Add delays, use caching

### BLOCKER 5: Database RLS Issues
**Problem:** Can't insert/update data
**Solution:** Check RLS policies

---

## 📋 STEP 1: CREATE GOOGLE OAUTH

### Follow These Exact Steps:

**1. Go to Google Cloud Console**
```
https://console.cloud.google.com
```

**2. Create/Select Project**
- If you have a project, select it
- If not: Click "New Project" → Name: "AiWealthanaire" → Create

**3. Enable Gmail API**
```
1. Click "APIs & Services" → "Library"
2. Search "Gmail API"
3. Click "Enable"
```

**4. Configure OAuth Consent Screen**
```
1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: "External"
3. Fill in:
   - App name: AiWealthanaire
   - User support email: [your email]
   - Developer contact: [your email]
4. Click "Save and Continue"
5. Click "Add or remove scopes"
6. Add:
   - ../auth/gmail.readonly
   - ../auth/gmail.send
7. Click "Save and Continue"
8. Click "Back to dashboard"
```

**5. Create OAuth Credentials**
```
1. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Name: "AiWealthanaire Gmail"
4. Authorized redirect URIs:
   https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/gmail-oauth-callback
5. Click "Create"
6. Copy:
   - Client ID: _________________
   - Client Secret: _________________
```

**GIVE THESE TO ME AFTER YOU CREATE THEM**

---

## 📋 STEP 2: SET SECRETS IN SUPABASE

Once you give me Client ID + Secret:
```bash
supabase secrets set GMAIL_CLIENT_ID="your-client-id"
supabase secrets set GMAIL_CLIENT_SECRET="your-client-secret"
```

---

## 📋 STEP 3: RUN DATABASE MIGRATIONS

### In Supabase SQL Editor, run:

```sql
-- ============================================
-- CONTRACTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  property_id UUID REFERENCES properties(id),
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

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contracts" ON public.contracts
  FOR ALL USING (auth.uid() = account_id);

-- ============================================
-- ADD COLUMNS TO PROPERTIES
-- ============================================

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_status TEXT DEFAULT 'new';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS agreed_price NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_structure TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS closing_date DATE;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS contract_id UUID;

CREATE INDEX idx_props_deal_status ON properties(deal_status);
CREATE INDEX idx_contracts_status ON contracts(status);
```

---

## 📋 STEP 4: VERIFY PROPERTIES TABLE

Run this to check your properties:
```sql
-- Check properties table exists and has data
SELECT COUNT(*) as total_properties FROM properties;

-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('deal_status', 'agreed_price', 'deal_structure');
```

---

## 📋 STEP 5: CHECK GMAIL OAUTH IN USER CONFIG

```sql
-- Check user_api_config table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_api_config';

-- Check if gmail columns exist
SELECT * FROM user_api_config LIMIT 1;
```

---

## 📋 STEP 6: TEST SEND-EMAIL FUNCTION

```bash
# Test the send-email function
curl -X POST https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "property_id": "TEST",
    "recipient_email": "your-email@gmail.com",
    "test_mode": true
  }'
```

---

## 📋 STEP 7: N8N SETUP

### Option A: n8n Cloud (Easier)
```
1. Go to https://n8n.io
2. Sign up for cloud account
3. Create new workflow
4. Import JSON files
```

### Option B: n8n Local (Your Docker)
```
1. Make sure n8n is running
   docker ps | grep n8n
2. Open http://localhost:5678
```

### Configure n8n Credentials:
```
1. Gmail: Connect your Gmail account
2. OpenRouter: Add API key from openrouter.ai
3. Supabase: Add your anon key + service key
```

---

## 📋 STEP 8: IMPORT WORKFLOWS

### Workflow 1: Auto-Responder
1. Open n8n
2. Click "Import from File"
3. Select: `n8n-workflows/ai-responder-v2.json`
4. Replace placeholders:
   - `YOUR_OPENROUTER_KEY` → your key
   - `YOUR_SUPABASE_ANON_KEY` → your anon key
   - `YOUR_ACCOUNT_ID` → your account UUID
5. Save and Activate

### Workflow 2: Contract Generation
1. Import: `n8n-workflows/contract-generation.json`
2. Replace:
   - `YOUR_HTML2PDF_API_KEY` → Get from html2pdf.app
   - `YOUR_SUPABASE_SERVICE_KEY` → your service key
   - `YOUR_EMAIL` → your email
3. Save and Activate

### Workflow 3: Contract Approval
1. Import: `n8n-workflows/contract-approval.json`
2. Replace:
   - `YOUR_SUPABASE_ANON_KEY` → your anon key
   - `YOUR_EMAIL` → your email
3. Save and Activate

---

## 📋 STEP 9: TEST THE FULL FLOW

### Test 1: Upload Property
```sql
-- Check you have properties
SELECT address, listing_price FROM properties LIMIT 5;
```

### Test 2: Score Property
```sql
-- Update a property to have a score
UPDATE properties SET deal_status = 'email_sent' WHERE id = 'YOUR_PROPERTY_ID';
```

### Test 3: Trigger Contract Generation
```sql
-- Manually set deal to terms agreed
UPDATE properties
SET deal_status = 'terms_agreed',
    agreed_price = 250000,
    deal_structure = 'Seller Finance',
    closing_date = '2026-03-15'
WHERE id = 'YOUR_PROPERTY_ID';
```

### Check n8n:
- Should see execution in logs
- Should receive email for approval

---

## 🚨 TROUBLESHOOTING

### Problem: "Function not found"
```
Solution: supabase functions deploy send-email
```

### Problem: "RLS Policy Denied"
```
Solution: Check auth.uid() matches account_id
```

### Problem: "Invalid OAuth credentials"
```
Solution: Check Client ID/Secret are correct
```

### Problem: "Rate limit exceeded"
```
Solution: Wait 1 minute, add delays in code
```

### Problem: n8n can't reach Supabase webhook
```
Solution: Use ngrok: ngrok http 5678
```

---

## ✅ COMPLETE CHECKLIST

| Step | Status | Notes |
|------|--------|-------|
| Create Google OAuth | ⬜ Do this now | |
| Give me Client ID/Secret | ⬜ After creation | |
| Run SQL migrations | ⬜ In Supabase | |
| Verify properties table | ⬜ Run query | |
| Test send-email | ⬜ Run curl | |
| Set up n8n credentials | ⬜ In n8n UI | |
| Import 3 workflows | ⬜ In n8n UI | |
| Test full flow | ⬜ Manual trigger | |

---

## 🎯 WHAT COULD GO WRONG

### 1. **Gmail OAuth Won't Work**
- Wrong redirect URI
- Consent screen not configured
- Scope not added
- **Fix:** Double-check step 4 above

### 2. **Emails Go to Spam**
- New Gmail account
- No SPF/DKIM
- **Fix:** Warm up account, use proper from address

### 3. **n8n Can't Connect**
- Local network issue
- **Fix:** Use n8n.cloud or ngrok

### 4. **Database Errors**
- RLS blocking inserts
- Missing columns
- **Fix:** Check SQL output, verify tables

### 5. **AI Response Bad**
- Prompt needs tuning
- API key wrong
- **Fix:** Adjust prompts in n8n

---

## 📞 READY TO START

**Do this FIRST:**
1. Create Google OAuth (15 min)
2. Give me Client ID + Secret

**Then I'll:**
1. Set secrets
2. Deploy functions
3. Guide you through n8n setup

**Let's go!** 🚀
