-- Add Gmail OAuth refresh token to user_api_config
-- Run this in Supabase SQL Editor

-- Add refresh_token column (for reading emails via Gmail API)
ALTER TABLE user_api_config 
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT;

-- Add OAuth tokens column for storing full OAuth credentials
ALTER TABLE user_api_config 
ADD COLUMN IF NOT EXISTS gmail_tokens JSONB;

-- Add status column to track connection
ALTER TABLE user_api_config 
ADD COLUMN IF NOT EXISTS gmail_status TEXT DEFAULT 'disconnected',  -- 'disconnected', 'connected', 'error'
ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMPTZ;

SELECT '✅ Added Gmail OAuth columns to user_api_config' as status;