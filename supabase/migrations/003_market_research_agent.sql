-- Market Research Agent - Stores market analysis results
-- This table stores the comprehensive market analysis done by the Market Research Agent

CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  -- Key metrics extracted for quick access
  total_properties INTEGER,
  avg_listing_price NUMERIC,
  avg_equity NUMERIC,
  avg_days_on_market NUMERIC,
  high_equity_count INTEGER,
  motivated_count INTEGER,
  free_clear_count INTEGER,
  subject_to_viable INTEGER,
  seller_finance_viable INTEGER,
  primary_strategy TEXT,
  secondary_strategy TEXT,
  -- Market context for underwriter
  market_context JSONB,
  -- Filters for next list upload
  recommended_filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_market_analysis_dataset ON market_analysis(dataset_id);
CREATE INDEX idx_market_analysis_created ON market_analysis(created_at DESC);

-- Enable RLS
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users
CREATE POLICY "Users can view market analysis" ON market_analysis
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for service role
CREATE POLICY "Service role can manage market analysis" ON market_analysis
  FOR ALL USING (auth.role() = 'service_role');
