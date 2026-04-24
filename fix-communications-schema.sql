-- Fix communications table schema
-- Run this in Supabase Dashboard: https://supabase.com/dashboard/project/mabphntvwnxmhshqbqcn/sql/new

-- Step 1: Add missing columns to communications table
ALTER TABLE communications
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS gmail_message_id TEXT,
ADD COLUMN IF NOT EXISTS level TEXT;

-- Step 2: Create indexes for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_communications_account_id ON communications(account_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON communications(sent_at);
CREATE INDEX IF NOT EXISTS idx_communications_gmail_message_id ON communications(gmail_message_id);

-- Step 3: Delete incomplete communication records (sent but missing data)
-- These are records where the email sent but logging failed
DELETE FROM communications
WHERE to_email IS NULL
AND status = 'sent';

-- Step 4: Verify the fix
SELECT
  COUNT(*) as total_records,
  COUNT(CASE WHEN to_email IS NOT NULL THEN 1 END) as complete_records,
  COUNT(CASE WHEN to_email IS NULL THEN 1 END) as incomplete_records,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_records,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_records
FROM communications;
