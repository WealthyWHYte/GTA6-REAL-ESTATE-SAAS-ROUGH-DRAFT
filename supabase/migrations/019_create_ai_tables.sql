-- ============================================================================
-- FIX: Create communications table properly
-- Run this in Supabase SQL Editor
-- ============================================================================

-- First check what tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- ============================================================================
-- COMMUNICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  communication_id TEXT UNIQUE,
  account_id UUID NOT NULL DEFAULT auth.uid(),
  property_id TEXT,
  dataset_id TEXT,
  direction TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  subject TEXT,
  body TEXT,
  email_type TEXT,
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_model TEXT,
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_communications_account ON communications(account_id);
CREATE INDEX IF NOT EXISTS idx_communications_property ON communications(property_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);

-- Enable RLS
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "communications_select" ON communications;
CREATE POLICY "communications_select" ON communications
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "communications_insert" ON communications;
CREATE POLICY "communications_insert" ON communications
  FOR INSERT WITH CHECK (account_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "communications_update" ON communications;
CREATE POLICY "communications_update" ON communications
  FOR UPDATE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "communications_delete" ON communications;
CREATE POLICY "communications_delete" ON communications
  FOR DELETE USING (account_id = auth.uid());

-- Service role access
DROP POLICY IF EXISTS "service_communications" ON communications;
CREATE POLICY "service_communications" ON communications
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- MARKET_ANALYSIS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id TEXT UNIQUE,
  account_id UUID NOT NULL DEFAULT auth.uid(),
  dataset_id TEXT,
  city TEXT,
  state TEXT,
  median_price INTEGER,
  avg_days_on_market INTEGER,
  price_per_sqft INTEGER,
  market_temp TEXT,
  investment_grade TEXT,
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

ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_analysis_select" ON market_analysis;
CREATE POLICY "market_analysis_select" ON market_analysis
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "market_analysis_insert" ON market_analysis;
CREATE POLICY "market_analysis_insert" ON market_analysis
  FOR INSERT WITH CHECK (account_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "market_analysis_service" ON market_analysis;
CREATE POLICY "market_analysis_service" ON market_analysis
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- PROPERTY_ANALYSIS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id TEXT UNIQUE,
  account_id UUID NOT NULL DEFAULT auth.uid(),
  property_id TEXT NOT NULL,
  estimated_arv INTEGER,
  estimated_equity INTEGER,
  equity_percent DECIMAL(5,2),
  deal_score INTEGER,
  win_win_score INTEGER,
  recommended_strategy TEXT,
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

ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_analysis_select" ON property_analysis;
CREATE POLICY "property_analysis_select" ON property_analysis
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "property_analysis_insert" ON property_analysis;
CREATE POLICY "property_analysis_insert" ON property_analysis
  FOR INSERT WITH CHECK (account_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "property_analysis_update" ON property_analysis;
CREATE POLICY "property_analysis_update" ON property_analysis
  FOR UPDATE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "property_analysis_service" ON property_analysis;
CREATE POLICY "property_analysis_service" ON property_analysis
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- USER_PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL DEFAULT auth.uid() UNIQUE,
  ai_tier TEXT DEFAULT 'software',
  max_budget_monthly DECIMAL(10,2),
  preferred_model TEXT,
  notification_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_preferences_select" ON user_preferences;
CREATE POLICY "user_preferences_select" ON user_preferences
  FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "user_preferences_insert" ON user_preferences;
CREATE POLICY "user_preferences_insert" ON user_preferences
  FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "user_preferences_update" ON user_preferences;
CREATE POLICY "user_preferences_update" ON user_preferences
  FOR UPDATE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "user_preferences_service" ON user_preferences;
CREATE POLICY "user_preferences_service" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- DONE
-- ============================================================================
SELECT '✅ All tables created successfully!' as status;
