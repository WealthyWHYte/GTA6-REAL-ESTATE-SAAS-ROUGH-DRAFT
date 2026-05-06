# Project Summary

## Overall Goal
Build a real estate investor CRM SaaS application (GTA 6 Real Estate) with automated email handling, property analysis, and offer management. The current focus is fixing email sending functionality and ensuring the Email Closer CRM interface displays all features properly.

## Key Knowledge
- **Tech Stack**: Next.js, Supabase (DB + Edge Functions), Tailwind CSS, TypeScript
- **Database Tables**: `user_api_config` (stores Gmail tokens), `communications`, `follow_up_queue`, `property_analysis`, `offers`, `properties`
- **Gmail Token Flow**: User reconnects Gmail in Settings → token saved to `user_api_config.gmail_refresh_token` → send-email fetches from DB → uses to get fresh access token
- **Supabase Project ID**: mabphntvwnxmhshqbqcn
- **Build Commands**: `npx supabase functions deploy <name>`, `npx tsc --noEmit`
- **Critical Fix**: Complex Supabase query joins (e.g., `properties:property_id(...)`) cause 400 errors - need to query simple fields and filter in JavaScript

## Recent Actions
1. **[DONE]** Fixed send-email to use DB tokens (`gmail_refresh_token` from `user_api_config`) instead of env vars
2. **[DONE]** Fixed messageId variable scope bug in send-email function (was undefined after sendGmail call)
3. **[DONE]** Fixed 400 errors on follow_up_queue queries - removed complex foreign key join syntax that Supabase was rejecting
4. **[DONE]** All CRM features already exist in code (Pending Approval, Notes, Tags, Snooze, Replies counter)
5. **[DONE]** Pushed all fixes to GitHub main branch

## Current Plan
1. **[IN PROGRESS]** Verify follow_up_queue fix works - user should refresh Email Closer
2. **[TODO]** Check if any other queries have similar 400 error issues
3. **[TODO]** Verify Pending Approval drafts showing in UI (may need actual data in DB with `status = 'pending_approval'`)

## Technical Details
- **send-email Edge Function Location**: `supabase/functions/send-email/index.ts`
- **Email Closer UI Location**: `src/pages/agents/email-closer.tsx`
- **Known Issues Fixed**:
  - Token expired errors → Now fetches from DB
  - messageId not defined → Now properly captured
  - follow_up_queue 400 errors → Removed `properties:property_id(...)` join syntax

---

## Summary Metadata
**Update time**: 2026-05-06T20:50:44.553Z 
