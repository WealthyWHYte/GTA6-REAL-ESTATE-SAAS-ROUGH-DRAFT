-- Add all missing tables for complete automation
-- Migration: 20250629000000_add_missing_tables.sql

-- ============================================================================
-- OFFERS TABLE - Generated offer tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id TEXT UNIQUE NOT NULL,
  property_id TEXT NOT NULL,
  account_id UUID NOT NULL,
  offer_price DECIMAL(12, 2) NOT NULL,
  terms JSONB,
  contingencies JSONB,
  closing_date DATE,
  earnest_money DECIMAL(10, 2),
  status TEXT DEFAULT 'generated', -- generated, sent, accepted, rejected, closed
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offers_property ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_account ON offers(account_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- ============================================================================
-- BLACK MARKET LISTINGS - Disposition output
-- ============================================================================
CREATE TABLE IF NOT EXISTS black_market_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  account_id UUID NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  profit_potential DECIMAL(10, 2),
  deal_type TEXT,
  status TEXT DEFAULT 'available', -- available, sold, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_black_market_property ON black_market_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_black_market_account ON black_market_listings(account_id);
CREATE INDEX IF NOT EXISTS idx_black_market_status ON black_market_listings(status);

-- ============================================================================
-- ACTIVITY LOG - Agent action tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT,
  dataset_id TEXT,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_property ON activity_log(property_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_dataset ON activity_log(dataset_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_agent ON activity_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================================================
-- EMAIL CREDENTIALS - SMTP/IMAP authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL, -- gmail, outlook, yahoo, sendgrid, mailgun
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  smtp_username TEXT NOT NULL,
  smtp_password TEXT NOT NULL, -- Should be encrypted in production
  imap_host TEXT,
  imap_port INTEGER,
  imap_username TEXT,
  imap_password TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, email_address)
);

CREATE INDEX IF NOT EXISTS idx_email_credentials_account ON email_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_email_credentials_active ON email_credentials(is_active);

-- ============================================================================
-- EMAIL LOG - Outbound email tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  property_id TEXT,
  offer_id TEXT,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  template_type TEXT, -- initialOffer, followUp, negotiation, closing
  status TEXT DEFAULT 'pending', -- pending, sent, failed, bounced
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_log_account ON email_log(account_id);
CREATE INDEX IF NOT EXISTS idx_email_log_property ON email_log(property_id);
CREATE INDEX IF NOT EXISTS idx_email_log_offer ON email_log(offer_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_sent ON email_log(sent_at DESC);

-- ============================================================================
-- EMAIL RESPONSES - Inbound email tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  email_log_id UUID,
  property_id TEXT,
  offer_id TEXT,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  sentiment TEXT, -- positive, negative, neutral
  intent TEXT, -- interested, negotiation, rejection, questions
  keywords TEXT[],
  requires_response BOOLEAN DEFAULT FALSE,
  suggested_response TEXT,
  responded BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (email_log_id) REFERENCES email_log(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_responses_account ON email_responses(account_id);
CREATE INDEX IF NOT EXISTS idx_email_responses_property ON email_responses(property_id);
CREATE INDEX IF NOT EXISTS idx_email_responses_offer ON email_responses(offer_id);
CREATE INDEX IF NOT EXISTS idx_email_responses_sentiment ON email_responses(sentiment);
CREATE INDEX IF NOT EXISTS idx_email_responses_responded ON email_responses(responded);
CREATE INDEX IF NOT EXISTS idx_email_responses_received ON email_responses(received_at DESC);

-- ============================================================================
-- CONTRACTS - Generated legal documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id TEXT UNIQUE NOT NULL,
  account_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  contract_type TEXT NOT NULL, -- purchase_agreement, assignment_contract, etc.
  terms JSONB NOT NULL,
  document_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, sent, signed, executed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contracts_account ON contracts(account_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_offer ON contracts(offer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- ============================================================================
-- COMMUNICATIONS - Message history (for future Telegram/SMS integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  property_id TEXT,
  channel TEXT NOT NULL, -- email, telegram, sms, call
  direction TEXT NOT NULL, -- inbound, outbound
  from_contact TEXT,
  to_contact TEXT,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_communications_account ON communications(account_id);
CREATE INDEX IF NOT EXISTS idx_communications_property ON communications(property_id);
CREATE INDEX IF NOT EXISTS idx_communications_channel ON communications(channel);
CREATE INDEX IF NOT EXISTS idx_communications_created ON communications(created_at DESC);

-- ============================================================================
-- EMAIL QUEUE - Scheduled follow-up emails
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  property_id TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_used TEXT,
  priority TEXT DEFAULT 'normal', -- low, normal, high
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_queue_account ON email_queue(account_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_property ON email_queue(property_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);

-- ============================================================================
-- Add missing columns to properties table
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS offer_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS offer_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS offer_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS offer_terms JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deal_stage TEXT DEFAULT 'prospect';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS validation_notes TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_phone TEXT;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE black_market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (authenticated users can only access their own data)
CREATE POLICY "Users can view their own offers" ON offers
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own offers" ON offers
  FOR UPDATE USING (auth.uid() = account_id);

CREATE POLICY "Users can view their own black market listings" ON black_market_listings
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own black market listings" ON black_market_listings
  FOR INSERT WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own black market listings" ON black_market_listings
  FOR UPDATE USING (auth.uid() = account_id);

CREATE POLICY "Users can view their own activity log" ON activity_log
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert activity log" ON activity_log
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view their own email credentials" ON email_credentials
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can manage their own email credentials" ON email_credentials
  FOR ALL USING (auth.uid() = account_id);

CREATE POLICY "Users can view their own email log" ON email_log
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own email log" ON email_log
  FOR INSERT WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can view their own email responses" ON email_responses
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can manage their own email responses" ON email_responses
  FOR ALL USING (auth.uid() = account_id);

CREATE POLICY "Users can view their own contracts" ON contracts
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can manage their own contracts" ON contracts
  FOR ALL USING (auth.uid() = account_id);

CREATE POLICY "Users can view their own communications" ON communications
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own communications" ON communications
  FOR INSERT WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can view their own email queue" ON email_queue
  FOR SELECT USING (auth.uid() = account_id);

CREATE POLICY "Users can manage their own email queue" ON email_queue
  FOR ALL USING (auth.uid() = account_id);

-- ============================================================================
-- Triggers for updated_at columns
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_black_market_listings_updated_at BEFORE UPDATE ON black_market_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_credentials_updated_at BEFORE UPDATE ON email_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
