-- Add Gmail OAuth columns to user_api_config (run this to fix)
ALTER TABLE user_api_config 
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS gmail_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMPTZ;