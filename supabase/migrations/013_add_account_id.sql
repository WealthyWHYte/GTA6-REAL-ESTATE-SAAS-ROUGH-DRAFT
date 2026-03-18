-- Add account_id to market_analysis table
ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES auth.users(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_market_analysis_account ON market_analysis(account_id);

-- Update RLS policy if needed (should already allow users to see their own)
DROP POLICY IF EXISTS "Users view market analysis" ON market_analysis;
CREATE POLICY "Users view own market analysis" ON market_analysis
  FOR ALL USING (auth.uid() = account_id);

SELECT '✅ Added account_id to market_analysis' as status;
