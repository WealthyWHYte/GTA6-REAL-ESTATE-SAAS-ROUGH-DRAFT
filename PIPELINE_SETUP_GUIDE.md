# GTA 6 Real Estate Pipeline - Complete Setup Guide

This guide walks you through setting up the complete automated investment pipeline.

## Pipeline Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Pipeline Scout │────▶│ Market Research  │────▶│   Underwriter    │
│   (Upload CSV)  │     │   (Apify + API)  │     │  (Knowledge Base)│
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    Dispo Agent  │◀────│  Email Closer    │◀────│  Offer Generator │
│ (Black Mkt/PML) │     │  (Follow-up/Nego)│     │  (LOI + Terms)   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Step 1: Set Up Supabase Database

### 1.1 Run the Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `mabphntvwnxmhshqbqcn`
3. Open **SQL Editor**
4. Copy contents of `supabase/schema.sql`
5. Run the SQL

### 1.2 Create Storage Bucket

```sql
-- Creates the 'offers' bucket for PDF storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('offers', 'offers', true);
```

---

## Step 2: Deploy Edge Functions

### 2.1 Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd supabase
supabase link --project-ref mabphntvwnxmhshqbqcn
```

### 2.2 Deploy All Functions

```bash
# Deploy each function
supabase functions deploy process-csv
supabase functions deploy market-research
supabase functions deploy underwrite-property
supabase functions deploy generate-offer
supabase functions deploy send-email
supabase functions deploy dispo-match
```

### 2.3 Set Environment Secrets

```bash
# Set Apify token for market research
supabase secrets set APIFY_API_TOKEN=your_apify_token

# Set Resend API key for emails
supabase secrets set RESEND_API_KEY=your_resend_api_key

# Optional: OpenAI for AI features
supabase secrets set OPENAI_API_KEY=your_openai_key
```

---

## Step 3: Get API Keys

### 3.1 Apify (Market Research)
1. Go to [Apify](https://apify.com)
2. Sign up / Login
3. Go to **Settings → Integrations**
4. Copy your **API Token**
5. Get Zillow/Redfin scrapers from [Apify Store](https://apify.com/store)

### 3.2 Resend (Email)
1. Go to [Resend](https://resend.com)
2. Sign up / Login
3. Go to **API Keys**
4. Create and copy your API key
5. Verify your domain for sending

---

## Step 4: Configure Frontend

### 4.1 Update Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://mabphntvwnxmhshqbqcn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4.2 Update Routes

The agent pages are ready in `src/pages/agents/`:
- `pipeline-scout.tsx` - Upload & clean CSV
- `market-research.tsx` - View research results
- `underwriter.tsx` - Review strategies
- `offer-generator.tsx` - Generate offers
- `email-closer.tsx` - Handle communications
- `contract-specialist.tsx` - Track contracts
- `dispo-match.tsx` - Match with buyers

---

## Step 5: Test the Pipeline

### 5.1 Create Test CSV

Create a file `test_properties.csv`:

```csv
address,city,state,zip,price,bedrooms,bathrooms,sqft,agent_name,agent_email,agent_phone
123 Main St,Miami,FL,33101,450000,3,2,1800,John Smith,john@realty.com,555-0100
456 Oak Ave,Miami,FL,33102,375000,2,2,1400,Jane Doe,jane@realty.com,555-0200
789 Pine Rd,Miami,FL,33103,525000,4,3,2200,Bob Johnson,bob@realty.com,555-0300
```

### 5.2 Run Through Pipeline

1. **Upload** → Pipeline Scout processes CSV
2. **Research** → Market Research gathers Zillow/Redfin data
3. **Underwrite** → Knowledge Base recommends strategy
4. **Generate** → Offer Generator creates PDF
5. **Send** → Email Closer sends to agent
6. **Follow Up** → Automated follow-up schedule
7. **Dispo** → Match with Black Market/PML buyers

---

## Knowledge Base Structure

### Strategies

| Strategy | Min CoC | ARV Discount | Best For |
|----------|---------|--------------|----------|
| Long Term Rental | 12% | ≤85% | Cash flow focus |
| Fix & Flip | N/A | 70-80% | Quick profits |
| Lease Option | 8% | N/A | Low equity sellers |
| Subject To | 10% | N/A | Existing mortgage |
| BRRRR | 15% | N/A | Portfolio growth |
| Wholesale | N/A | ≤60% | Quick assignment |

### Objection Handling

| Objection | Response Strategy |
|-----------|------------------|
| Low Offer | Show comps, highlight quick closing |
| Financing | Explain seller financing benefits |
| Timing | Offer flexible closing date |
| Multiple | Deadline pressure, best and final |

---

## Troubleshooting

### Edge Function Errors

```bash
# View function logs
supabase functions logs process-csv

# Test function locally
supabase functions serve process-csv
```

### Common Issues

1. **400 Bad Request on Properties**
   - Check column names match schema
   - Ensure `account_id` is included

2. **CORS Errors**
   - Add localhost to allowed origins in Supabase
   - Check function has correct permissions

3. **Email Not Sending**
   - Verify Resend API key
   - Check sender email is verified

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| Supabase | 500MB DB, 1GB Storage | $25/mo for more |
| Apify | 10% of compute | ~$49/mo for regular scraping |
| Resend | 3,000 emails/mo | $20/mo for more |

---

## Next Steps

1. ✅ Run database schema
2. ✅ Deploy Edge Functions
3. ✅ Set API keys
4. ⏳ Test with sample CSV
5. ⏳ Add PML buyers
6. ⏳ Configure Black Market listings

---

## Support

- Supabase Docs: https://supabase.com/docs
- Apify Docs: https://docs.apify.com
- Resend Docs: https://resend.com/docs
