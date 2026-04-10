-- Run this in Supabase Dashboard > SQL Editor
-- Adds missing columns to property_analysis table for email-closer

DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS address TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS city TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS state TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS bedrooms INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS bathrooms NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS sqft INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS year_built INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS property_type TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS days_on_market INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS listing_price INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS estimated_value INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS open_mortgage_balance NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS mortgage_rate NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS agent_name TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS agent_email TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS agent_phone TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS seller_name TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS seller_email TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS seller_phone TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS reasoning TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS strategy TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS recommendation TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS offer_price INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS offer_percent NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS max_score INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level1_offer_price INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level1_entry_fee INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level1_monthly_payment NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level1_seller_carry_rate NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level2_offer_price INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level2_entry_fee INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level3_offer_price INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level3_entry_fee INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level3_monthly_payment NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS level3_seller_carry_rate NUMERIC; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS recommended_level INTEGER; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS recommended_reason TEXT; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS factors JSONB; END; $$;
DO $$ BEGIN ALTER TABLE property_analysis ADD COLUMN IF NOT EXISTS ai_analysis TEXT; END; $$;

CREATE INDEX IF NOT EXISTS idx_property_analysis_address ON property_analysis(address);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'property_analysis'
ORDER BY ordinal_position;
