-- Migration: Add all CSV columns to properties table
-- Run this to enable full CSV upload support

-- ============================================================================
-- Basic Info Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS county TEXT;

-- ============================================================================
-- Property Details Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lot_sqft NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_use TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS units INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS stories INTEGER;

-- ============================================================================
-- Owner Info Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner1_first_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner1_last_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner2_first_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner2_last_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner3_first_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner3_last_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner4_first_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner4_last_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_mailing_address TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_mailing_city TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_mailing_state TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_mailing_zip TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ownership_length_months INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_occupied TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS vacant TEXT;

-- ============================================================================
-- Listing Info Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_status TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_on_market INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_full_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_first_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_last_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mls_type TEXT;

-- ============================================================================
-- Sale History Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_sale_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_sale_amount NUMERIC;

-- ============================================================================
-- Financial Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_equity NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_equity_percent NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS open_mortgage_balance NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mortgage_interest_rate NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mortgage_document_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mortgage_loan_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lender_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deed_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS position TEXT;

-- ============================================================================
-- Tax & Assessment Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tax_amount NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS assessment_year INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS assessed_total_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS assessed_land_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS assessed_improvement_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS assessed_improvement_pct NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_land_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_improvement_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_improvement_pct NUMERIC;

-- ============================================================================
-- Auction Columns
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS default_amount NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS opening_bid NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS recording_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS auction_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS auction_time TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS auction_courthouse TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS auction_address TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS auction_city_state TEXT;

-- ============================================================================
-- Create indexes for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_external_id ON properties(external_id);
CREATE INDEX IF NOT EXISTS idx_properties_county ON properties(county);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON properties(year_built);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties(listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_price ON properties(listing_price);
CREATE INDEX IF NOT EXISTS idx_properties_estimated_value ON properties(estimated_value);
CREATE INDEX IF NOT EXISTS idx_properties_auction_date ON properties(auction_date);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_pipeline_status ON properties(pipeline_status);
