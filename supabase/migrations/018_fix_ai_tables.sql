-- ============================================================================
-- FIX: Add missing tables and columns for AI Agents
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- COMMUNICATIONS TABLE - Email tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  communication_id TEXT UNIQUE,
  account_id UUID NOT NULL,
  property_id TEXT,
  dataset_id TEXT,
  direction TEXT, -- outbound, inbound
  recipient_email TEXT,
  recipient_name TEXT,
  subject TEXT,
  body TEXT,
  email_type TEXT, -- initial_outreach, follow_up, objection_handler, offer_presentation, closing
  status TEXT DEFAULT 'draft', -- draft, sent, delivered, opened, replied
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_model TEXT,
  ai_provider TEXT, -- software_brain, user_credits
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_communications_account ON communications(account_id);
CREATE INDEX IF NOT EXISTS idx_communications_property ON communications(property_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_direction ON communications(direction);

-- ============================================================================
-- MARKET_ANALYSIS TABLE - Market research results
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id TEXT UNIQUE,
  account_id UUID NOT NULL,
  dataset_id TEXT,
  city TEXT,
  state TEXT,
  median_price INTEGER,
  avg_days_on_market INTEGER,
  price_per_sqft INTEGER,
  market_temp TEXT, -- Hot, Warm, Cool, Cold
  investment_grade TEXT, -- A+, A, B+, B, C+, C, D
  top_opportunities JSONB,
  risk_factors JSONB,
  deal_strategy TEXT,
  properties_analyzed INTEGER,
  analysis_data JSONB,
  ai_model TEXT,
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_analysis_account ON market_analysis(account_id);
CREATE INDEX IF NOT EXISTS idx_market_analysis_city ON market_analysis(city, state);

-- ============================================================================
-- PROPERTY_ANALYSIS TABLE - Underwriting results
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id TEXT UNIQUE,
  account_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  estimated_arv INTEGER,
  estimated_equity INTEGER,
  equity_percent DECIMAL(5,2),
  deal_score INTEGER, -- 0-100
  win_win_score INTEGER, -- 0-100
  recommended_strategy TEXT, -- Subject-To, Seller Financing, Cash, Lease Option, Hybrid
  strengths JSONB,
  risks JSONB,
  max_offer_price INTEGER,
  expected_roi DECIMAL(5,2),
  analysis_data JSONB,
  ai_model TEXT,
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_property_analysis_account ON property_analysis(account_id);
CREATE INDEX IF NOT EXISTS idx_property_analysis_property ON property_analysis(property_id);

-- ============================================================================
-- USER_PREFERENCES TABLE - AI tier settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL UNIQUE,
  ai_tier TEXT DEFAULT 'software', -- software (free), credits (paid)
  max_budget_monthly DECIMAL(10,2),
  preferred_model TEXT,
  notification_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_account ON user_preferences(account_id);

-- ============================================================================
-- USER_API_CONFIG TABLE - User's own API keys
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_api_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL UNIQUE,
  openai_key TEXT,
  openrouter_key TEXT,
  groq_key TEXT,
  provider TEXT DEFAULT 'openrouter',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_api_config_account ON user_api_config(account_id);

-- ============================================================================
-- GRANTS - Ensure proper access
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communications
DROP POLICY IF EXISTS "Users can read own communications" ON communications;
CREATE POLICY "Users can read own communications" ON communications
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own communications" ON communications;
CREATE POLICY "Users can insert own communications" ON communications
  FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own communications" ON communications;
CREATE POLICY "Users can update own communications" ON communications
  FOR UPDATE USING (account_id = auth.uid());

-- RLS Policies for market_analysis
DROP POLICY IF EXISTS "Users can read own market_analysis" ON market_analysis;
CREATE POLICY "Users can read own market_analysis" ON market_analysis
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own market_analysis" ON market_analysis;
CREATE POLICY "Users can insert own market_analysis" ON market_analysis
  FOR INSERT WITH CHECK (account_id = auth.uid());

-- RLS Policies for property_analysis
DROP POLICY IF EXISTS "Users can read own property_analysis" ON property_analysis;
CREATE POLICY "Users can read own property_analysis" ON property_analysis
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own property_analysis" ON property_analysis;
CREATE POLICY "Users can insert own property_analysis" ON property_analysis
  FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own property_analysis" ON property_analysis;
CREATE POLICY "Users can update own property_analysis" ON property_analysis
  FOR UPDATE USING (account_id = auth.uid());

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can read own user_preferences" ON user_preferences;
CREATE POLICY "Users can read own user_preferences" ON user_preferences
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own user_preferences" ON user_preferences;
CREATE POLICY "Users can insert own user_preferences" ON user_preferences
  FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own user_preferences" ON user_preferences;
CREATE POLICY "Users can update own user_preferences" ON user_preferences
  FOR UPDATE USING (account_id = auth.uid());

-- RLS Policies for user_api_config
DROP POLICY IF EXISTS "Users can read own user_api_config" ON user_api_config;
CREATE POLICY "Users can read own user_api_config" ON user_api_config
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own user_api_config" ON user_api_config;
CREATE POLICY "Users can insert own user_api_config" ON user_api_config
  FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own user_api_config" ON user_api_config;
CREATE POLICY "Users can update own user_api_config" ON user_api_config
  FOR UPDATE USING (account_id = auth.uid());

-- Service role can access everything (for Edge Functions)
DROP POLICY IF EXISTS "Service role can access communications" ON communications;
CREATE POLICY "Service role can access communications" ON communications
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can access market_analysis" ON market_analysis;
CREATE POLICY "Service role can access market_analysis" ON market_analysis
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can access property_analysis" ON property_analysis;
CREATE POLICY "Service role can access property_analysis" ON property_analysis
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can access user_preferences" ON user_preferences;
CREATE POLICY "Service role can access user_preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can access user_api_config" ON user_api_config;
CREATE POLICY "Service role can access user_api_config" ON user_api_config
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- FIX: Add account_id column if missing in existing tables
-- ============================================================================

-- Fix properties table if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'account_id') THEN
    ALTER TABLE properties ADD COLUMN account_id UUID;
  END IF;
END $$;

-- Fix offers table if needed  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'account_id') THEN
    ALTER TABLE offers ADD COLUMN account_id UUID;
  END IF;
END $$;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT '✅ Database tables created/fixed successfully!' as status;
