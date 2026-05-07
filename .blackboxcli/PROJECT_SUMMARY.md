# Project Summary

## Overall Goal
Build a GTA 6 Real Estate SaaS CRM with AI-powered email negotiation agents that automatically polls Gmail for replies, detects objections, and drafts responses for human approval before sending.

## Key Knowledge

**Technology Stack:**
- Frontend: React + TypeScript + Tailwind CSS + shadcn components
- Backend: Supabase (PostgreSQL) with Edge Functions
- Auth: Supabase Auth with hardcoded account ID for cron jobs
- Deployment: Vercel (frontend), Supabase Edge Functions

**Critical Account ID:**
```
ACCOUNT_ID = '757a0f4a-49cd-43b3-b6c2-70274f611039'
```
Used to match cron-scheduler saves with frontend queries.

**Database Schema - communications table columns:**
- `account_id`, `property_id`, `to_email`, `to_name`
- `subject`, `body` (NOT `message`)
- `direction` (inbound/outbound)
- `status` (pending_approval, sent, etc.)
- `email_type` (ai_draft, sent, etc.)
- `gmail_message_id`, `created_at`

**Deployment Commands:**
```bash
supabase functions deploy cron-scheduler --no-verify-jwt
supabase functions deploy send-email --no-verify-jwt
git add -A && git commit -m "message" && git push
```

## Recent Actions

**Bug Fixes:**
1. [DONE] Fixed 400 errors by removing complex Supabase joins and using simple field lists
2. [DONE] Fixed account_id mismatch - frontend now uses hardcoded ACCOUNT_ID
3. [DONE] Fixed cron-scheduler communications insert - changed `message`→`body`, `direction`→`outbound`, `email_type`→`ai_draft`, added `status: pending_approval`
4. [DONE] Fixed duplicate emails - added 60-second duplicate check before insert in send-email
5. [DONE] Fixed pending_approvals query - removed `email_type = 'ai_draft'` filter (was too restrictive)

**Visual Upgrades - matching email_closer_crm_mockup.html:**
1. [DONE] 4 colored stat cards with left border accents: orange (Pending Response), yellow (Due Follow-up), green (Replies Received), blue (Pending Approval)
2. [DONE] Gold-bordered AI Pending Approval section with Approve & Send (green), Edit, Discard (red) buttons
3. [DONE] Offer cards with urgency-colored left borders: red=14+ days, orange=7-14 days, green=<7 days
4. [DONE] Recent Activity with icon circles: AI (amber), IN (green), OUT (blue)
5. [DONE] Deduplicated activity by subject + date

**Deployed:**
- cron-scheduler ✅ (--no-verify-jwt)
- send-email ✅ (--no-verify-jwt)
- Frontend last pushed: fac4285

**Test Verification:**
- SQL confirmed AI draft saved: `status='pending_approval'`, `email_type='ai_draft'`, to_email='info@propwire.com'

## Current Plan

**Outstanding Issues:**
1. [IN PROGRESS] Visual changes not showing in browser - duplicate `communications` query causing build errors in email-closer.tsx
2. [TODO] Replace entire return JSX block with clean layout matching mockup (write_file entire component)
3. [TODO] Verify browser renders new layout correctly

**CRM Features Implemented:**
- ✅ Pending Response counter
- ✅ Replies Received counter  
- ✅ Due for Follow-up counter
- ✅ Pending Approval section (shows AI drafts)
- ✅ Notes field
- ✅ Tags
- ✅ Snooze button
- ✅ Email templates
- ✅ Offer levels/pipeline

**Next Steps:**
1. Fix duplicate `communications` useQuery in email-closer.tsx (lines ~127-157 vs ~170-185)
2. Rewrite return block to match mockup exactly
3. Push and verify browser shows new layout

---

## Summary Metadata
**Update time**: 2026-05-06T23:13:01.967Z 
