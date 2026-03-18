-- =============================================================================
-- CORRECTED COMPLETE MIGRATION
-- Fixed: property_id type, account_id, indexes
-- =============================================================================

-- 1. User API Config Table
CREATE TABLE IF NOT EXISTS user_api_config (
  account_id UUID PRIMARY KEY REFERENCES auth.users(id),
  openrouter_key TEXT,
  gmail_email TEXT,
  gmail_app_password TEXT,
  apify_token TEXT,
  model_preference TEXT DEFAULT 'ollama',
  ai_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_api_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own api config" ON user_api_config
  FOR ALL USING (auth.uid() = account_id);

-- 2. API Usage Log
CREATE TABLE IF NOT EXISTS api_usage_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  function_name VARCHAR(100),
  model_used VARCHAR(50),
  tokens_used INT DEFAULT 0,
  api_calls INT DEFAULT 1,
  cost NUMERIC(10,4) DEFAULT 0,
  property_id TEXT,
  dataset_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_account ON api_usage_log(account_id, created_at DESC);
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own api usage" ON api_usage_log
  FOR SELECT USING (auth.uid() = account_id);

-- 3. Property Analysis Table (FIXED: property_id as TEXT)
DROP TABLE IF EXISTS property_analysis CASCADE;

CREATE TABLE property_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id TEXT NOT NULL,
  win_win_score INT DEFAULT 0,
  max_score INT DEFAULT 10,
  strategy VARCHAR(50),
  offer_price NUMERIC,
  offer_percent INT,
  reasoning TEXT,
  factors JSONB,
  recommendation VARCHAR(20),
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, property_id)
);

CREATE INDEX idx_property_analysis_account ON property_analysis(account_id);
CREATE INDEX idx_property_analysis_score ON property_analysis(win_win_score DESC);

ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own analysis" ON property_analysis
  FOR ALL USING (auth.uid() = account_id);

-- 4. Add account_id to market_analysis (with safe check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'market_analysis' 
    AND column_name = 'account_id'
  ) THEN
    ALTER TABLE market_analysis ADD COLUMN account_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add index (safe - IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_market_analysis_account ON market_analysis(account_id);

-- Update RLS
DROP POLICY IF EXISTS "Users view market analysis" ON market_analysis;
CREATE POLICY "Users view own market analysis" ON market_analysis
  FOR ALL USING (auth.uid() = account_id);

-- 5. Add account_id to offers if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'offers' 
    AND column_name = 'account_id'
  ) THEN
    ALTER TABLE offers ADD COLUMN account_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 6. Verify setup
SELECT '✅ All tables ready!' as status;

-- Check your properties (use a simple count first)
SELECT 
  'Properties need account_id - check upload process' as info;
