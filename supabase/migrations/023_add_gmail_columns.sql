-- Add Gmail OAuth columns to user_api_config
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_email TEXT;
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT;
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_client_id TEXT;
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_client_secret TEXT;
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_access_token TEXT;
ALTER TABLE user_api_config ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMP WITH TIME ZONE;