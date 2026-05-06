-- Add Gmail OAuth token columns to user_api_config
-- Run this to add missing columns for Gmail OAuth

ALTER TABLE user_api_config 
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMP WITH TIME ZONE;

-- Update existing column if needed
DO $$ 
BEGIN
  -- Make sure existing columns are nullable
  ALTER TABLE user_api_config ALTER COLUMN gmail_refresh_token DROP NOT NULL;
  ALTER TABLE user_api_config ALTER COLUMN gmail_email DROP NOT NULL;
  ALTER TABLE user_api_config ALTER COLUMN gmail_status DROP NOT NULL;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

COMMENT ON COLUMN user_api_config.gmail_access_token IS 'Gmail API access token';
COMMENT ON COLUMN user_api_config.gmail_token_expiry IS 'Gmail token expiry timestamp';