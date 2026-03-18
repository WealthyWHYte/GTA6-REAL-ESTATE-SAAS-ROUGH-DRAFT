-- =====================================================
-- USER API CONFIG - SIMPLIFIED
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. User API Configuration (simpler than before)
CREATE TABLE IF NOT EXISTS user_api_config (
  account_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- API Keys (NULL = use free Ollama tier)
  openrouter_key TEXT,
  gmail_email TEXT,
  gmail_app_password TEXT,
  apify_token TEXT,
  
  -- Preferences
  model_preference TEXT DEFAULT 'ollama',  -- 'ollama', 'claude-haiku', 'claude-sonnet', 'claude-opus'
  ai_tier TEXT DEFAULT 'free',  -- 'free' (Ollama) or 'pro' (paid API)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. API Usage Log (track all calls)
CREATE TABLE IF NOT EXISTS api_usage_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  
  -- What was called
  function_name VARCHAR(100),  -- 'analyze-market', 'underwrite-property', 'send-email'
  model_used VARCHAR(50),      -- 'ollama', 'claude-haiku', 'claude-sonnet', etc.
  
  -- Usage metrics
  tokens_used INT DEFAULT 0,
  api_calls INT DEFAULT 1,
  cost NUMERIC(10,4) DEFAULT 0,  -- $0 for Ollama, actual cost for paid
  
  -- Context
  property_id UUID,
  dataset_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_account ON api_usage_log(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_month ON api_usage_log(account_id, date_trunc('month', created_at));

-- 4. RLS
ALTER TABLE user_api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own config" ON user_api_config
  FOR ALL USING (auth.uid() = account_id);

CREATE POLICY "Users view own usage" ON api_usage_log
  FOR SELECT USING (auth.uid() = account_id);

-- 5. Helper function to get user's API config
CREATE OR REPLACE FUNCTION get_user_config(p_account_id UUID)
RETURNS TABLE (
  openrouter_key TEXT,
  gmail_email TEXT,
  gmail_app_password TEXT,
  apify_token TEXT,
  model_preference TEXT,
  ai_tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.openrouter_key,
    u.gmail_email,
    u.gmail_app_password,
    u.apify_token,
    u.model_preference,
    u.ai_tier
  FROM user_api_config u
  WHERE u.account_id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Helper to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_account_id UUID,
  p_function VARCHAR,
  p_model VARCHAR,
  p_tokens INT,
  p_cost NUMERIC,
  p_property_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_usage_log (
    account_id, function_name, model_used, 
    tokens_used, cost, property_id
  ) VALUES (
    p_account_id, p_function, p_model,
    p_tokens, p_cost, p_property_id
  );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ User API Config tables created!' as status;
