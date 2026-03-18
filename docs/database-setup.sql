-- ============================================
-- GTA 6 Database Setup - FIXED
-- ============================================

-- Check if RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'properties';

-- Fix Properties RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "properties_ select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;

CREATE POLICY "properties_ select" ON properties FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (account_id::text = auth.uid()::text);

GRANT ALL ON properties TO service_role;

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- Buyers Table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  buyer_type VARCHAR(50),
  max_budget DECIMAL(15,2),
  preferred_locations TEXT[],
  property_types TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyers_select" ON buyers FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "buyers_insert" ON buyers FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "buyers_update" ON buyers FOR UPDATE USING (account_id::text = auth.uid()::text);
GRANT ALL ON buyers TO service_role;

-- Communications Table
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id TEXT,
  offer_id TEXT,
  comm_type VARCHAR(50),
  direction VARCHAR(20),
  to_email VARCHAR(255),
  to_name VARCHAR(255),
  from_email VARCHAR(255),
  subject VARCHAR(500),
  message TEXT,
  category VARCHAR(100),
  sentiment VARCHAR(50),
  message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  received_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communications_select" ON communications FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "communications_insert" ON communications FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "communications_update" ON communications FOR UPDATE USING (account_id::text = auth.uid()::text);
GRANT ALL ON communications TO service_role;

-- Underwriting Decisions Table
CREATE TABLE IF NOT EXISTS underwriting_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id TEXT,
  strategy VARCHAR(100),
  score DECIMAL(5,2),
  arv DECIMAL(15,2),
  repair_cost DECIMAL(15,2),
  max_allowable_offer DECIMAL(15,2),
  expected_rent DECIMAL(15,2),
  cash_on_cash_return DECIMAL(10,2),
  reasoning JSONB,
  recommendation VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE underwriting_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "underwriting_select" ON underwriting_decisions FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "underwriting_insert" ON underwriting_decisions FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "underwriting_update" ON underwriting_decisions FOR UPDATE USING (account_id::text = auth.uid()::text);
GRANT ALL ON underwriting_decisions TO service_role;

-- Follow Up Queue Table
CREATE TABLE IF NOT EXISTS follow_up_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id TEXT,
  offer_id TEXT,
  follow_up_type VARCHAR(50),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE follow_up_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follow_up_select" ON follow_up_queue FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "follow_up_insert" ON follow_up_queue FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "follow_up_update" ON follow_up_queue FOR UPDATE USING (account_id::text = auth.uid()::text);
GRANT ALL ON follow_up_queue TO service_role;

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id TEXT,
  buyer_id TEXT,
  assignment_fee DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_select" ON assignments FOR SELECT USING (account_id::text = auth.uid()::text);
CREATE POLICY "assignments_insert" ON assignments FOR INSERT WITH CHECK (account_id::text = auth.uid()::text);
CREATE POLICY "assignments_update" ON assignments FOR UPDATE USING (account_id::text = auth.uid()::text);
GRANT ALL ON assignments TO service_role;

-- ============================================
-- ADD MISSING COLUMNS TO PROPERTIES
-- ============================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_research JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS underwriting JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS recommended_strategy VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS repair_cost DECIMAL(15,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_allowable_offer DECIMAL(15,2);

SELECT '✅ All done! Tables created and RLS fixed!' as result;
