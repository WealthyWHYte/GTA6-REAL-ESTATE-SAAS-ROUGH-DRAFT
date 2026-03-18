-- Email Automation Database Setup
-- Run this in Supabase SQL Editor

-- Email Credentials Storage
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  provider VARCHAR(50),
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  imap_host VARCHAR(255),
  imap_port INTEGER,
  imap_user VARCHAR(255),
  imap_pass VARCHAR(255),
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  gmail_token JSONB,
  gmail_refresh_token VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Queue (for sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id UUID,
  to_email VARCHAR(255),
  to_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  template_used VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  response_to_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Responses (incoming)
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  property_id UUID,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  received_at TIMESTAMP,
  sentiment VARCHAR(50),
  confidence DECIMAL(5,2),
  key_phrases TEXT[],
  action_required VARCHAR(50),
  urgency VARCHAR(20),
  next_steps TEXT,
  ai_response_generated BOOLEAN DEFAULT false,
  human_reviewed BOOLEAN DEFAULT false,
  approved_for_send BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Settings (response delay, auto-send)
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID UNIQUE,
  response_delay_min INTEGER DEFAULT 3,
  response_delay_max INTEGER DEFAULT 9,
  auto_send BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT true,
  max_draft_variations INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "email_creds_own" ON email_credentials FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_queue_own" ON email_queue FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_responses_own" ON email_responses FOR ALL USING (account_id = auth.uid());
CREATE POLICY "email_settings_own" ON email_settings FOR ALL USING (account_id = auth.uid());

-- Grant service role
GRANT ALL ON email_credentials TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_responses TO service_role;
GRANT ALL ON email_settings TO service_role;

SELECT '✅ Email automation tables created!' as result;
