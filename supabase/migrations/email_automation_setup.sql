-- =====================================================
-- EMAIL AUTOMATION DATABASE SETUP
-- Run this in Supabase SQL Editor
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
  
  template_used VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Delay settings (human-like timing)
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  delay_minutes INTEGER DEFAULT 5,
  
  -- Thread tracking
  response_to_id UUID REFERENCES email_responses(id),
  thread_id VARCHAR(100),
  
  -- Human-in-the-loop
  needs_review BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  approved BOOLEAN,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Email Responses (incoming)
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  received_at TIMESTAMP,
  
  -- AI Analysis
  sentiment VARCHAR(50),
  confidence DECIMAL(5,2),
  key_phrases TEXT[],
  action_required VARCHAR(50),
  urgency VARCHAR(20),
  intent VARCHAR(100),
  next_steps TEXT,
  
  -- Response tracking
  ai_response_generated BOOLEAN DEFAULT false,
  human_reviewed BOOLEAN DEFAULT false,
  approved_for_send BOOLEAN DEFAULT false,
  
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Email Settings
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Response timing (human-like)
  response_delay_min INTEGER DEFAULT 3,
  response_delay_max INTEGER DEFAULT 9,
  
  -- Automation mode
  auto_send BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT true,
  
  -- Draft variations
  max_draft_variations INTEGER DEFAULT 3,
  
  -- Notifications
  notify_on_high_priority BOOLEAN DEFAULT true,
  notify_on_objection BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Email Activity Log
CREATE TABLE IF NOT EXISTS email_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  
  action VARCHAR(100),
  details JSONB,
  status VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_own_email_creds" ON email_credentials FOR ALL USING (account_id = auth.uid());
CREATE POLICY "users_own_email_queue" ON email_queue FOR ALL USING (account_id = auth.uid());
CREATE POLICY "users_own_email_responses" ON email_responses FOR ALL USING (account_id = auth.uid());
CREATE POLICY "users_own_email_settings" ON email_settings FOR ALL USING (account_id = auth.uid());
CREATE POLICY "users_own_email_activity" ON email_activity FOR ALL USING (account_id = auth.uid());

-- Service role access
GRANT ALL ON email_credentials TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_responses TO service_role;
GRANT ALL ON email_settings TO service_role;
GRANT ALL ON email_activity TO service_role;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Get next scheduled email
CREATE OR REPLACE FUNCTION get_next_scheduled_email()
RETURNS TABLE(
  id UUID,
  to_email VARCHAR,
  subject VARCHAR,
  body TEXT,
  delay_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eq.id,
    eq.to_email,
    eq.subject,
    eq.body,
    eq.delay_minutes
  FROM email_queue eq
  WHERE eq.status = 'pending'
    AND eq.scheduled_for <= NOW()
    AND eq.needs_review = false
  ORDER BY 
    CASE eq.priority 
      WHEN 'high' THEN 1 
      WHEN 'normal' THEN 2 
      ELSE 3 
    END,
    eq.scheduled_for ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Calculate random delay
CREATE OR REPLACE FUNCTION get_response_delay()
RETURNS INTEGER AS $$
DECLARE
  min_delay INTEGER;
  max_delay INTEGER;
BEGIN
  SELECT response_delay_min, response_delay_max 
  INTO min_delay, max_delay 
  FROM email_settings 
  LIMIT 1;
  
  RETURN FLOOR(RANDOM() * (max_delay - min_delay + 1)) + min_delay;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DEFAULT SETTINGS
-- =====================================================

INSERT INTO email_settings (account_id, response_delay_min, response_delay_max, auto_send, ai_enabled)
SELECT id, 3, 9, false, true
FROM auth.users
ON CONFLICT (account_id) DO NOTHING;

print('✅ Email automation tables created successfully!');
