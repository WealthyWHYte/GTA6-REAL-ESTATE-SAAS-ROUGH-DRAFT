-- =====================================================
-- COMPLETE DATABASE SETUP FOR AI WEALTHANAIRE
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: EMAIL AUTOMATION TABLES
-- =====================================================

-- 1. Email Credentials Storage
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'gmail',
  
  -- SMTP Settings (for sending)
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  
  -- IMAP Settings (for receiving)
  imap_host VARCHAR(255),
  imap_port INTEGER,
  imap_user VARCHAR(255),
  imap_pass VARCHAR(255),
  
  -- Gmail OAuth
  gmail_token JSONB,
  gmail_refresh_token TEXT,
  
  -- From Address
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Email Queue (outgoing)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  
  to_email VARCHAR(255),
  to_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  body_html TEXT,
  
  -- Email Type
  email_type VARCHAR(50), -- initial_offer, follow_up_1, follow_up_2, objection_response, counter_offer, closing
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, queued, sending, sent, failed, replied
  send_at TIMESTAMP,
  sent_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  
  -- Thread tracking
  gmail_thread_id VARCHAR(100),
  gmail_message_id VARCHAR(100),
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Email Threads (for conversation tracking)
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  
  -- Participants
  seller_email VARCHAR(255),
  seller_name VARCHAR(255),
  listing_agent_email VARCHAR(255),
  listing_agent_name VARCHAR(255),
  
  -- Thread Info
  subject VARCHAR(500),
  gmail_thread_id VARCHAR(100),
  
  -- Status
  status VARCHAR(30) DEFAULT 'active', -- active, pending_response, negotiated, accepted, rejected, expired
  
  -- Counters
  total_emails INTEGER DEFAULT 0,
  our_emails_sent INTEGER DEFAULT 0,
  replies_received INTEGER DEFAULT 0,
  
  -- Latest Update
  last_email_at TIMESTAMP,
  last_email_direction VARCHAR(10), -- inbound, outbound
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  
  name VARCHAR(100),
  type VARCHAR(50), -- initial_offer, follow_up_1, follow_up_2, objection_response, counter_offer, closing
  
  subject VARCHAR(500),
  body TEXT,
  body_html TEXT,
  
  -- Trigger conditions
  trigger_property_status VARCHAR(50), -- e.g., "underwritten", "offer_sent"
  trigger_days_after INTEGER, -- days after previous email
  
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 2: MARKET RESEARCH TABLES
-- =====================================================

-- Market Analysis Storage
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

-- =====================================================
-- PART 3: PROPERTY SCORING TABLES
-- =====================================================

-- Property Scores
CREATE TABLE IF NOT EXISTS property_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  account_id UUID REFERENCES auth.users(id),
  
  -- Scores
  total_score INTEGER,
  equity_score INTEGER,
  motivation_score INTEGER,
  price_score INTEGER,
  condition_score INTEGER,
  location_score INTEGER,
  
  -- Recommendation
  recommended_strategy VARCHAR(50),
  offer_price NUMERIC,
  max_offer_price NUMERIC,
  
  -- Notes
  analysis_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: INDEXES
-- =====================================================

-- Email Queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_property ON email_queue(property_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_account ON email_queue(account_id);

-- Email Threads indexes
CREATE INDEX IF NOT EXISTS idx_email_threads_property ON email_threads(property_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_status ON email_threads(status);

-- Market Analysis indexes
CREATE INDEX IF NOT EXISTS idx_market_analysis_dataset ON market_analysis(dataset_id);
CREATE INDEX IF NOT EXISTS idx_market_analysis_created ON market_analysis(created_at DESC);

-- Property Scores indexes
CREATE INDEX IF NOT EXISTS idx_property_scores_property ON property_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_property_scores_account ON property_scores(account_id);

-- =====================================================
-- PART 5: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_scores ENABLE ROW LEVEL SECURITY;

-- Email Credentials policies
CREATE POLICY "Users manage own email credentials" ON email_credentials
  FOR ALL USING (auth.uid() = account_id);

-- Email Queue policies
CREATE POLICY "Users manage own email queue" ON email_queue
  FOR ALL USING (auth.uid() = account_id);

-- Email Threads policies
CREATE POLICY "Users manage own email threads" ON email_threads
  FOR ALL USING (auth.uid() = account_id);

-- Email Templates policies
CREATE POLICY "Users manage own templates" ON email_templates
  FOR ALL USING (auth.uid() = account_id);

-- Market Analysis policies
CREATE POLICY "Users view market analysis" ON market_analysis
  FOR SELECT USING (auth.role() = 'authenticated');

-- Property Scores policies
CREATE POLICY "Users manage own scores" ON property_scores
  FOR ALL USING (auth.uid() = account_id);

-- =====================================================
-- PART 6: SEED EMAIL TEMPLATES
-- =====================================================

INSERT INTO email_templates (name, type, subject, body, is_active) VALUES
('Initial Offer', 'initial_offer', 
 'Creative Offer on {{property_address}}',
 'Dear {{seller_name}},

I hope this message finds you well. My name is {{my_name}} and I represent investors who are actively purchasing properties in {{property_city}}.

We recently came across your property at {{property_address}} and were impressed by what it has to offer.

Based on our analysis of the current market conditions in {{property_city}}, we would like to present you with a {{offer_type}} offer of ${{offer_amount}}.

This offer provides you with:
- {{benefit_1}}
- {{benefit_2}}
- {{benefit_3}}

We understand you may have questions or concerns, and I would welcome the opportunity to discuss this further at your convenience.

Please feel free to reach out to discuss any terms that might work better for your situation.

Best regards,
{{my_name}}
{{my_company}}
{{my_phone}}',
 true),

('Follow Up 1', 'follow_up_1',
 'Following Up - {{property_address}}',
 'Dear {{seller_name}},

I wanted to follow up on the offer I sent regarding your property at {{property_address}}.

I understand you may be busy, but I wanted to see if you had a chance to review our proposal.

We remain very interested in your property and are flexible on terms to make this work for both parties.

Please let me know if you have any questions or would like to discuss further.

Best regards,
{{my_name}}',
 true),

('Objection Response - Price', 'objection_response',
 'Re: {{property_address}} - Let''s Work Together',
 'Dear {{seller_name}},

Thank you for your feedback on our offer for {{property_address}}.

I completely understand your perspective on the price. Given the current market conditions in {{property_city}}, I wanted to explore other options that might work better for you:

1. {{creative_option_1}}
2. {{creative_option_2}}
3. {{creative_option_3}}

We''re committed to making this work and are open to discussing various terms including closing timeline, included furnishings, or other considerations.

Would you be open to a brief call to explore these options?

Best regards,
{{my_name}}',
 true);

-- =====================================================
-- DONE!
-- =====================================================

SELECT '✅ Database setup complete!' as status;
