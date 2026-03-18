-- Fix property_analysis constraint
-- Drop old constraint if exists, add correct one

-- First, try to drop the old constraint (ignore errors)
ALTER TABLE property_analysis DROP CONSTRAINT IF EXISTS property_analysis_property_id_key;
ALTER TABLE property_analysis DROP CONSTRAINT IF EXISTS property_analysis_pkey;

-- Add correct composite unique constraint
ALTER TABLE property_analysis ADD CONSTRAINT property_analysis_unique_prop 
  UNIQUE (account_id, property_id);

-- If table needs recreation, do it cleanly
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

SELECT '✅ Fixed property_analysis constraint!' as status;
