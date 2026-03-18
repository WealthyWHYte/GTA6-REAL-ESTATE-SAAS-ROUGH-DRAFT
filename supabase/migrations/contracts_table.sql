-- ============================================
-- CONTRACTS TABLE & DEAL STATUS UPDATES
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  property_id UUID REFERENCES properties(id),
  contract_type TEXT, -- 'Subject-To', 'Seller Finance', 'Cash'
  pdf_url TEXT,
  status TEXT DEFAULT 'generated', -- 'generated', 'approved', 'sent_for_signature', 'signed', 'rejected'
  agreed_price NUMERIC,
  down_payment NUMERIC,
  monthly_payment NUMERIC,
  interest_rate NUMERIC,
  term_years INTEGER,
  closing_date DATE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users manage their own contracts" ON public.contracts
  FOR ALL USING (auth.uid() = account_id);

-- 2. Add status column to properties if not exists
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_status TEXT DEFAULT 'new';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS agreed_price NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deal_structure TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS closing_date DATE;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);

-- 3. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_deal_status ON properties(deal_status);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- 4. Create function to update property status when contract changes
CREATE OR REPLACE FUNCTION update_property_from_contract()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE properties 
    SET deal_status = 'contract_approved',
        agreed_price = NEW.agreed_price,
        deal_structure = NEW.contract_type,
        closing_date = NEW.closing_date,
        contract_id = NEW.id
    WHERE id = NEW.property_id;
  ELSIF NEW.status = 'signed' AND OLD.status != 'signed' THEN
    UPDATE properties 
    SET deal_status = 'closed',
        closed_at = NOW()
    WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS contract_status_trigger ON contracts;
CREATE TRIGGER contract_status_trigger
  AFTER UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_property_from_contract();

-- 5. Enable pg_cron for automated jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule check every hour
SELECT cron.schedule(
  'check-pending-contracts',
  '0 * * * *',
  $$ 
  SELECT check_pending_contracts();
  $$
);

-- 6. Function to check pending contracts and send reminders
CREATE OR REPLACE FUNCTION check_pending_contracts()
RETURNS void AS $$
DECLARE
  pending_contract RECORD;
BEGIN
  FOR pending_contract IN 
    SELECT c.id, c.property_id, p.address, c.status, c.created_at
    FROM contracts c
    JOIN properties p ON c.property_id = p.id
    WHERE c.status = 'sent_for_signature'
      AND c.created_at < NOW() - INTERVAL '3 days'
  LOOP
    -- Log reminder (in production, send email)
    RAISE NOTICE 'Contract pending signature: % (ID: %)', 
      pending_contract.address, pending_contract.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify
-- SELECT * FROM contracts LIMIT 5;
-- SELECT deal_status, COUNT(*) FROM properties GROUP BY deal_status;
