-- =====================================================
-- EMAIL AUTOMATION DATABASE TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Email Credentials Storage
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  provider VARCHAR(50) DEFAULT 'gmail',
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  imap_host VARCHAR(255),
  imap_port INTEGER DEFAULT 993,
  imap_user VARCHAR(255),
  imap_pass VARCHAR(255),
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  gmail_token JSONB,
  gmail_refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Queue (for sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  to_email VARCHAR(255),
  to_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  template_used VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  response_to_id UUID,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Responses (incoming)
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
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

-- Email Settings
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) UNIQUE,
  response_delay_min INTEGER DEFAULT 3,
  response_delay_max INTEGER DEFAULT 9,
  auto_send BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT true,
  max_draft_variations INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Email Credentials Policies
CREATE POLICY "Users manage own email credentials" 
ON email_credentials FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

-- Email Queue Policies
CREATE POLICY "Users manage own email queue" 
ON email_queue FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

-- Email Responses Policies
CREATE POLICY "Users manage own email responses" 
ON email_responses FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

-- Email Settings Policies
CREATE POLICY "Users manage own email settings" 
ON email_settings FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

-- Service role access
GRANT ALL ON email_credentials TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_responses TO service_role;
GRANT ALL ON email_settings TO service_role;

-- =====================================================
-- MARKET RESEARCH EVALUATION TABLES
-- =====================================================

-- Store Market Scout Research Results
CREATE TABLE IF NOT EXISTS market_research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  
  -- Research Data
  comps JSONB,           -- Comparable properties found
  arv_calculation JSONB, -- ARV breakdown
  rental_data JSONB,    -- Rental comparables
  market_trends JSONB,  -- Market trend analysis
  
  -- Evaluation Scores (from Evaluation Agent)
  research_quality_score INTEGER, -- 1-100
  comp_relevance_score INTEGER,
  arv_accuracy_score INTEGER,
  market_understanding_score INTEGER,
  data_gaps TEXT[],      -- What's missing
  evaluation_notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending_evaluation', -- pending_evaluation, evaluated, approved, needs_improvement
  evaluated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Feedback
CREATE TABLE IF NOT EXISTS research_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  research_result_id UUID REFERENCES market_research_results(id),
  
  -- Evaluation Criteria
  criteria_1_comps_accuracy INTEGER,    -- Are comps relevant?
  criteria_2_arv_calculation INTEGER, -- Is ARV reasonable?
  criteria_3_market_context INTEGER,   -- Does it understand the area?
  criteria_4_data_completeness INTEGER, -- Enough data?
  criteria_5_actionability INTEGER,    -- Can we act on this?
  
  overall_score INTEGER,
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  additional_data_needed TEXT[],
  
  evaluator_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE market_research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own research results" 
ON market_research_results FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

CREATE POLICY "Users manage own evaluations" 
ON research_evaluations FOR ALL 
USING (account_id = auth.uid())
WITH CHECK (account_id = auth.uid());

GRANT ALL ON market_research_results TO service_role;
GRANT ALL ON research_evaluations TO service_role;

-- =====================================================
-- FUNCTION: Get Properties Needing Research Evaluation
-- =====================================================

CREATE OR REPLACE FUNCTION get_properties_for_evaluation()
RETURNS TABLE (
  id UUID,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  listing_price NUMERIC,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  pipeline_status TEXT,
  research_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.address, p.listing_address) as address,
    COALESCE(p.city, p.listing_city) as city,
    COALESCE(p.state, p.listing_state) as state,
    COALESCE(p.zip, p.listing_zip) as zip,
    COALESCE(p.listing_price, p.price) as listing_price,
    p.bedrooms,
    p.bathrooms,
    p.sqft,
    p.pipeline_status,
    mr.status as research_status
  FROM properties p
  LEFT JOIN market_research_results mr ON mr.property_id = p.id
  WHERE p.pipeline_status IN ('researching', 'underwriting', 'market_analysis')
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Calculate Research Quality Score
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_research_quality(
  p_comps JSONB,
  p_arv JSONB,
  p_rentals JSONB,
  p_trends JSONB
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  comps_count INTEGER;
  arv_valid BOOLEAN;
  rental_count INTEGER;
  trends_valid BOOLEAN;
BEGIN
  -- Comps scoring (0-30 points)
  comps_count := jsonb_array_length(COALESCE(p_comps, '[]'::jsonb));
  IF comps_count >= 5 THEN
    score := score + 30;
  ELSIF comps_count >= 3 THEN
    score := score + 20;
  ELSIF comps_count >= 1 THEN
    score := score + 10;
  END IF;
  
  -- ARV scoring (0-30 points)
  arv_valid := p_arv IS NOT NULL 
    AND p_arv->>'arv' IS NOT NULL 
    AND (p_arv->>'arv')::NUMERIC > 0;
  IF arv_valid THEN
    score := score + 30;
  END IF;
  
  -- Rental data scoring (0-20 points)
  rental_count := jsonb_array_length(COALESCE(p_rentals, '[]'::jsonb));
  IF rental_count >= 3 THEN
    score := score + 20;
  ELSIF rental_count >= 1 THEN
    score := score + 10;
  END IF;
  
  -- Market trends scoring (0-20 points)
  trends_valid := p_trends IS NOT NULL 
    AND jsonb_object_keys(p_trends) IS NOT NULL;
  IF trends_valid THEN
    score := score + 20;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Add Knowledge Base to existing tables if not exists
-- =====================================================

-- Add knowledge_base_url to properties if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'knowledge_base_url') THEN
    ALTER TABLE properties ADD COLUMN knowledge_base_url TEXT;
  END IF;
END $$;

-- Add research_completed to properties if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'research_completed') THEN
    ALTER TABLE properties ADD COLUMN research_completed BOOLEAN DEFAULT false;
    ALTER TABLE properties ADD COLUMN research_completed_at TIMESTAMP;
  END IF;
END $$;

PRINT '✅ Email automation tables created successfully!';
PRINT '✅ Market research evaluation tables created successfully!';
