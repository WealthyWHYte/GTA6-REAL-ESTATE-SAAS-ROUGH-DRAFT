-- Property Analysis Table - Stores underwriting scores
CREATE TABLE IF NOT EXISTS property_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(property_id),
  
  -- Scoring
  win_win_score INT DEFAULT 0,
  max_score INT DEFAULT 10,
  
  -- Recommendations
  strategy VARCHAR(50),
  offer_price NUMERIC,
  offer_percent INT,
  
  -- Reasoning
  reasoning TEXT,
  factors JSONB,
  recommendation VARCHAR(20),
  
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(account_id, property_id)
);

ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own analysis" ON property_analysis
  FOR ALL USING (auth.uid() = account_id);

-- Enable RLS on offers if not already
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own offers" ON offers
  FOR ALL USING (auth.uid() = account_id);

SELECT '✅ Property Analysis tables ready!' as status;
