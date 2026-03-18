-- =====================================================
-- USER API CONFIGURATION & USAGE TRACKING
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add API config to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS api_config JSONB DEFAULT '{}'::jsonb;

-- 2. API Usage Log Table
CREATE TABLE IF NOT EXISTS api_usage_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- API Service used
  api_service VARCHAR(50), -- 'openrouter', 'apify', 'zillow', 'gmail', 'smtp'
  
  -- Function that called it
  function_name VARCHAR(100), -- 'analyze-market', 'underwrite-property', 'send-email'
  
  -- Usage details
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 1,
  estimated_cost NUMERIC(10,4) DEFAULT 0,
  
  -- Request context
  property_id UUID,
  dataset_id UUID,
  request_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'rate_limited'
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. API Keys Storage (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Service
  service VARCHAR(50), -- 'openrouter', 'apify', 'zillow', 'gmail', 'smtp', 'rapidapi'
  
  -- Key storage (in production, use encryption)
  api_key_encrypted TEXT,
  api_key_last4 VARCHAR(10),
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb, -- model preferences, settings
  is_active BOOLEAN DEFAULT true,
  
  -- Testing
  last_test_at TIMESTAMPTZ,
  last_test_status VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- AI Preferences
  preferred_ai_model VARCHAR(50) DEFAULT 'claude-haiku',
  ai_depth VARCHAR(20) DEFAULT 'balanced', -- 'quick', 'balanced', 'deep'
  max_monthly_spend NUMERIC(10,2) DEFAULT 100.00,
  current_month_spend NUMERIC(10,2) DEFAULT 0,
  
  -- Email Preferences
  auto_send_emails BOOLEAN DEFAULT false,
  require_approval_before_send BOOLEAN DEFAULT true,
  email_template_style VARCHAR(20) DEFAULT 'professional', -- 'professional', 'casual', 'aggressive'
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  slack_webhook TEXT,
  
  -- Dashboard Preferences
  default_view VARCHAR(20) DEFAULT 'pipeline', -- 'pipeline', 'market', 'deals'
  show_advanced_metrics BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_api_usage_log_account ON api_usage_log(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_service ON api_usage_log(api_service, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_month ON api_usage_log(account_id, date_trunc('month', created_at));
CREATE INDEX IF NOT EXISTS idx_api_keys_account ON api_keys(account_id, service);
CREATE INDEX IF NOT EXISTS idx_user_preferences_account ON user_preferences(account_id);

-- ROW LEVEL SECURITY
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Usage Log policies
CREATE POLICY "Users view own usage" ON api_usage_log
  FOR SELECT USING (auth.uid() = user_id);

-- Preferences policies
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 5. Seed default preferences for new users
CREATE OR REPLACE FUNCTION init_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (account_id, user_id)
  VALUES (NEW.id, NEW.id)
  ON CONFLICT (account_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create preferences
DROP TRIGGER IF EXISTS after_account_created ON accounts;
CREATE TRIGGER after_account_created
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION init_user_preferences();

-- 6. Helper function to get user's API key
CREATE OR REPLACE FUNCTION get_user_api_key(p_account_id UUID, p_service VARCHAR)
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
BEGIN
  SELECT api_key_encrypted INTO v_key
  FROM api_keys
  WHERE account_id = p_account_id 
    AND service = p_service 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_key;
END;
$$ LANGUAGE plpgsql;

-- 7. Helper function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_account_id UUID,
  p_user_id UUID,
  p_service VARCHAR,
  p_function VARCHAR,
  p_tokens INTEGER,
  p_cost NUMERIC,
  p_property_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_usage_log (
    account_id, user_id, api_service, function_name,
    tokens_used, estimated_cost, property_id, request_metadata
  ) VALUES (
    p_account_id, p_user_id, p_service, p_function,
    p_tokens, p_cost, p_property_id, p_metadata
  );
  
  -- Update monthly spend
  UPDATE user_preferences 
  SET current_month_spend = current_month_spend + p_cost
  WHERE account_id = p_account_id;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ API Configuration tables created!' as status;
