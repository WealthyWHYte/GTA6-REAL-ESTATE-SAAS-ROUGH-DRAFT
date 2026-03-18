-- Disposition System - Buyers Table
-- Run this in Supabase SQL Editor

-- Create buyers table for investor/buyer list
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  buyer_type TEXT DEFAULT 'investor', -- investor, end_buyer, cash_buyer
  min_price INTEGER,
  max_price INTEGER,
  min_beds INTEGER,
  max_beds INTEGER,
  min_sqft INTEGER,
  max_sqft INTEGER,
  preferred_locations TEXT[], -- array of cities/states
  preferred_property_types TEXT[], -- array of property types
  financing_type TEXT, -- cash, hard_money, conventional, fha, va
  max_down_payment_percentage INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, under_contract, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buyers
DROP POLICY IF EXISTS buyers_read ON buyers;
DROP POLICY IF EXISTS buyers_insert ON buyers;
DROP POLICY IF EXISTS buyers_update ON buyers;
DROP POLICY IF EXISTS buyers_delete ON buyers;

CREATE POLICY buyers_read ON buyers FOR SELECT USING (account_id = auth.uid());
CREATE POLICY buyers_insert ON buyers FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY buyers_update ON buyers FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY buyers_delete ON buyers FOR DELETE USING (account_id = auth.uid());

-- Create property_buyer_matches table
CREATE TABLE IF NOT EXISTS property_buyer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  property_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  match_score INTEGER DEFAULT 0, -- 0-100 match score
  match_reasons TEXT[], -- reasons why this is a good match
  status TEXT DEFAULT 'pending', -- pending, contacted, interested, not_interested, under_contract
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE property_buyer_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS matches_read ON property_buyer_matches;
DROP POLICY IF EXISTS matches_insert ON property_buyer_matches;
DROP POLICY IF EXISTS matches_update ON property_buyer_matches;

CREATE POLICY matches_read ON property_buyer_matches FOR SELECT USING (account_id = auth.uid());
CREATE POLICY matches_insert ON property_buyer_matches FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY matches_update ON property_buyer_matches FOR UPDATE USING (account_id = auth.uid());

SELECT '✅ Disposition tables created!' as status;
