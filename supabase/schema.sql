-- Complete Database Schema for GTA 6 Real Estate SaaS
-- Run this in Supabase SQL Editor

-- ============================================
-- CORE TABLES (Existing - with enhancements)
-- ============================================

-- Properties table already exists, add new columns
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS offer_price numeric,
ADD COLUMN IF NOT EXISTS offer_terms jsonb,
ADD COLUMN IF NOT EXISTS offer_id text,
ADD COLUMN IF NOT EXISTS offer_date date,
ADD COLUMN IF NOT EXISTS underwriting_notes text,
ADD COLUMN IF NOT EXISTS dispo_match_score numeric,
ADD COLUMN IF NOT EXISTS dispo_match_type text;

-- ============================================
-- OFFERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  offer_id text NOT NULL UNIQUE,
  property_id text NOT NULL,
  account_id uuid NOT NULL,
  offer_price numeric NOT NULL,
  terms jsonb NOT NULL DEFAULT '{}',
  status text DEFAULT 'generated' CHECK (status = ANY (ARRAY['generated'::text, 'sent'::text, 'pending_response'::text, 'accepted'::text, 'declined'::text, 'countered'::text, 'withdrawn'::text])),
  file_url text,
  sent_at timestamp with time zone,
  response_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (property_id) REFERENCES public.properties(property_id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

-- ============================================
-- UNDERWRITING DECISIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.underwriting_decisions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  account_id uuid NOT NULL,
  recommended_strategy text NOT NULL,
  strategy_name text NOT NULL,
  strategy_description text,
  offer_price numeric,
  arv numeric,
  offer_terms jsonb NOT NULL DEFAULT '{}',
  projected_coc numeric,
  projected_dscr numeric,
  risk_score integer CHECK (risk_score BETWEEN 0 AND 100),
  confidence_level integer CHECK (confidence_level BETWEEN 0 AND 100),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (property_id) REFERENCES public.properties(property_id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

-- ============================================
-- FOLLOW UP QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.follow_up_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  offer_id text NOT NULL,
  follow_up_type text NOT NULL CHECK (follow_up_type = ANY (ARRAY['follow_up_1'::text, 'follow_up_2'::text, 'negotiation'::text, 'objection_handling'::text, 'closing_reminder'::text])),
  scheduled_for timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'skipped'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (property_id) REFERENCES public.properties(property_id),
  FOREIGN KEY (offer_id) REFERENCES public.offers(offer_id)
);

-- ============================================
-- DISPO MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.dispo_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  account_id uuid NOT NULL,
  black_market_matches jsonb NOT NULL DEFAULT '[]',
  pml_matches jsonb NOT NULL DEFAULT '[]',
  overall_score numeric,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (property_id) REFERENCES public.properties(property_id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

-- ============================================
-- PML BUYERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pml_buyers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  company_name text,
  preferred_strategies text[] DEFAULT '{}',
  preferred_cities text[] DEFAULT '{}',
  preferred_zips text[] DEFAULT '{}',
  preferred_states text[] DEFAULT '{}',
  min_price numeric DEFAULT 0,
  max_price numeric DEFAULT 1000000,
  active boolean DEFAULT true,
  max_deals integer DEFAULT 5,
  active_deals integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

-- ============================================
-- KNOWLEDGE BASE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['strategy'::text, 'objection'::text, 'term'::text, 'negotiation'::text, 'market'::text])),
  key text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  UNIQUE (category, key)
);

-- ============================================
-- MARKET RESEARCH RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.market_research (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  source text NOT NULL CHECK (source = ANY (ARRAY['zillow'::text, 'redfin'::text, 'realtor'::text, 'public_records'::text, 'manual'::text])),
  arv numeric,
  rent_estimate numeric,
  comparables jsonb DEFAULT '[]',
  sold_comps jsonb DEFAULT '[]',
  days_on_market integer,
  price_per_sqft numeric,
  market_trends jsonb DEFAULT '{}',
  raw_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (property_id) REFERENCES public.properties(property_id)
);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  template_type text NOT NULL UNIQUE CHECK (template_type = ANY (ARRAY['initial_offer'::text, 'follow_up_1'::text, 'follow_up_2'::text, 'negotiation'::text, 'objection_low'::text, 'objection_finance'::text, 'objection_timing'::text, 'closing_request'::text, 'acceptance'::text, 'rejection'::text])),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
underwriting_decisionsALTER TABLE public. ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispo_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pml_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own offers" ON public.offers
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their underwriting decisions" ON public.underwriting_decisions
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their follow-up queue" ON public.follow_up_queue
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their dispo matches" ON public.dispo_matches
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PML buyers" ON public.pml_buyers
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their knowledge base" ON public.knowledge_base
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their market research" ON public.market_research
  FOR ALL USING (property_id IN (
    SELECT property_id FROM public.properties WHERE account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can access their email templates" ON public.email_templates
  FOR ALL USING (account_id IN (
    SELECT id FROM public.accounts WHERE user_id = auth.uid()
  ));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pml_buyers_updated_at
  BEFORE UPDATE ON public.pml_buyers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate pipeline status
CREATE OR REPLACE FUNCTION calculate_pipeline_status()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.deal_stage
    WHEN 'prospect' THEN NEW.pipeline_status = 'scouted';
    WHEN 'researching' THEN NEW.pipeline_status = 'market_research';
    WHEN 'qualified' THEN NEW.pipeline_status = 'underwriting';
    WHEN 'offer_pending' THEN NEW.pipeline_status = 'offer_generation';
    WHEN 'offer_sent' THEN NEW.pipeline_status = 'offer_sent';
    WHEN 'under_contract' THEN NEW.pipeline_status = 'contract';
    WHEN 'closing' THEN NEW.pipeline_status = 'closing';
    WHEN 'closed' THEN NEW.pipeline_status = 'closed';
    WHEN 'lost' THEN NEW.pipeline_status = 'lost';
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEFAULT EMAIL TEMPLATES
-- ============================================

INSERT INTO public.email_templates (account_id, template_type, name, subject, body)
VALUES 
  (NULL, 'initial_offer', 'Initial Offer', 'Cash Offer for {address}', 
   'Dear {agent_name},\n\nI hope this email finds you well. I''m reaching out regarding your listing at {address}.\n\nAfter reviewing the property and analyzing recent comparable sales, I''d like to submit a cash offer.\n\nOffer Details:\n- Purchase Price: {offer_price}\n- Closing: Within 7-14 days\n- Condition: As-is inspection\n\nPlease let me know if you have any questions.\n\nBest regards,\nInvestment Team'),
  (NULL, 'follow_up_1', 'First Follow Up', 'Following Up - {address}',
   'Hi {agent_name},\n\nI wanted to follow up on my offer for {address} that I sent earlier this week.\n\nI''m very interested in this property and would love the opportunity to discuss.\n\nBest,\nInvestment Team'),
  (NULL, 'follow_up_2', 'Second Follow Up', '{address} - Any Updates?',
   'Dear {agent_name},\n\nI''m following up once more on my offer for {address}.\n\nIf this offer isn''t what your seller is looking for, I''d welcome the opportunity to adjust terms.\n\nBest regards,\nInvestment Team');

-- ============================================
-- DEFAULT KNOWLEDGE BASE ENTRIES
-- ============================================

INSERT INTO public.knowledge_base (account_id, category, key, title, content)
VALUES
  (NULL, 'strategy', 'long_term_rental', 'Long Term Rental Strategy', 
   '{"min_coc": 12, "max_arv_discount": 0.85, "preferred_down_payment": 20, "ideal_dscr": 1.5, "exit_strategy": "hold_5_years"}'::jsonb),
  (NULL, 'strategy', 'flip', 'Fix and Flip Strategy',
   '{"min_arv_discount": 0.70, "max_arv_discount": 0.80, "quick_closing": true, "exit_strategy": "retail_sale"}'::jsonb),
  (NULL, 'strategy', 'lease_option', 'Lease Option Strategy',
   '{"min_coc": 8, "option_fee_pct": 3, "monthly_credit": 100, "lease_term_months": 24, "purchase_price_pct": 90}'::jsonb),
  (NULL, 'strategy', 'subject_to', 'Subject To Strategy',
   '{"min_coc": 10, "cash_to_seller": 5000, "requires_mortgage": true, "exit_strategy": "refinance_or_sell"}'::jsonb),
  (NULL, 'objection', 'low_offer', 'Handling Low Offer Objection',
   '{"response": "Based on recent comparable sales in the area, this price reflects current market conditions.", "alternatives": ["split difference", "include closing costs", "flexible timeline"]}'::jsonb),
  (NULL, 'objection', 'finance', 'Handling Financing Objection',
   '{"response": "While cash offers are appealing, seller financing can provide monthly income.", "alternatives": ["partial cash", "credit against price", "lease option"]}'::jsonb);

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create offers storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('offers', 'offers', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies
CREATE POLICY "Users can upload their own offers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'offers' AND
    exists (
      SELECT 1 FROM public.accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their own offers" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'offers' AND
    exists (
      SELECT 1 FROM public.accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- EDGE FUNCTION SETUP (Run in Supabase CLI)
-- ============================================

/*
To deploy Edge Functions:

1. Install Supabase CLI: npm install -g supabase
2. Login: supabase login
3. Link project: supabase link --project-ref <your-project-ref>
4. Deploy functions:
   supabase functions deploy process-csv
   supabase functions deploy market-research
   supabase functions deploy underwrite-property
   supabase functions deploy generate-offer
   supabase functions deploy send-email
   supabase functions deploy dispo-match

5. Set environment variables:
   supabase secrets set --project-ref <ref> APIFY_API_TOKEN=your_apify_token
   supabase secrets set --project-ref <ref> RESEND_API_KEY=your_resend_key
*/
