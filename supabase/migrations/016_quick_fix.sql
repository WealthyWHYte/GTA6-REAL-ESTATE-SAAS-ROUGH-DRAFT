-- Quick fix: Clear and rebuild property_analysis
-- Run this in Supabase SQL Editor

-- 1. Clear old data
DELETE FROM property_analysis WHERE true;

-- 2. Recreate table with correct constraint
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
DROP POLICY IF EXISTS "Users manage own analysis" ON property_analysis;
CREATE POLICY "Users manage own analysis" ON property_analysis
  FOR ALL USING (auth.uid() = account_id);

-- 3. Show your properties
SELECT 
  p.address,
  p.listing_price,
  p.estimated_equity,
  p.days_on_market,
  p.mortgage_balance
FROM properties p
WHERE p.account_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
LIMIT 5;

SELECT '✅ Ready! Now click Re-Analyze Market in your app' as status;
