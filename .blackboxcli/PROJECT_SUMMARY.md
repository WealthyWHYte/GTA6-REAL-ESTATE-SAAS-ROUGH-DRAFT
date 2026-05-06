# Project Summary

## Overall Goal
Build a real estate SaaS platform with Gmail OAuth integration for automated listing agent communications, using Supabase Edge Functions.

## Key Knowledge
- **Supabase Project**: `mabphntvwnxmhshqbqcn`
- **Target Account ID**: `757a0f4a-49cd-43b3-b6c2-70274f611039` (goldenwaffle86@gmail.com)
- **Deployment Flag**: `--no-verify-jwt` (required for both functions)
- **Token Storage**: `user_api_config` table with columns:
  - `gmail_refresh_token` (stores OAuth refresh token)
  - `gmail_access_token` (stores access token)
  - `gmail_token_expiry` (ISO timestamp for expiry)
  - `gmail_email` (user's Gmail address)
- **Token Refresh Logic**: Check expiry 5 minutes before actual expiry time; refresh via `POST https://oauth2.googleapis.com/token` with `grant_type=refresh_token`

## Recent Actions
1. **[DONE] Updated gmail-oauth-handler**: Changed from storing tokens in `gmail_app_password` to using proper `gmail_refresh_token` column; added explicit error logging: `console.log('Upsert result:', JSON.stringify(data), 'Error:', JSON.stringify(error))`
2. **[DONE] Updated cron-scheduler**: Now queries `user_api_config` where `account_id = '757a0f4a-49cd-43b3-b6c2-70274f611039'`; uses `gmail_refresh_token` from DB with fallback to `GMAIL_REFRESH_TOKEN` env var
3. **[DONE] Added token expiry check**: Before polling Gmail, checks if `gmail_token_expiry` is expired or null; refreshes access token via Google OAuth if needed; updates `gmail_access_token` and `gmail_token_expiry` in DB
4. **[DONE] All deployments pushed to GitHub** after each change

## Current Plan
- [DONE] Fix gmail-oauth-handler to save to correct column (`gmail_refresh_token`)
- [DONE] Update cron-scheduler to query specific account and use proper token columns
- [DONE] Add token expiry refresh logic before polling Gmail
- [TODO] User needs to click a fresh OAuth link to authorize again (so tokens save to correct column)
- [TODO] Test cron-scheduler to verify Gmail polling works

---

## Summary Metadata
**Update time**: 2026-05-06T18:02:52.588Z 
