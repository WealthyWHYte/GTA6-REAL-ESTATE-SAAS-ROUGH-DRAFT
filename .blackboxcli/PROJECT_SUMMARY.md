# Project Summary

## Overall Goal
Build GTA 6 Real Estate SaaS platform - a real estate investment tool that helps agents analyze properties, generate creative finance offers, and close deals via email automation.

## Key Knowledge

- **Project Root**: `/Users/antwaunm/Library/Mobile Documents/com~apple~CloudDocs/Projects3/GTA 6 Real Estate/gta-6-real-estate-saas-rough draft`
- **Tech Stack**: React + Vite + TypeScript + TanStack Query + Supabase + shadcn/ui
- **Build Command**: `npm run build`
- **Visual Site**: https://www.gta6.miami/
- **Route**: `/agent/email-closer`
- **Hardcoded Account ID**: `757a0f4a-49cd-43b3-b6c2-70274f611039`

### Code Conventions
- Component files go in `src/components/email-closer/`
- Parent page (`email-closer.tsx`) acts as thin orchestrator (< 200 lines)
- Property data passed via `useLocation()` state from Underwriter page
- Join offers with `properties(*)` table to get addresses

## Recent Actions

1. **[DONE] Split monolithic email-closer.tsx into 5 modular components**:
   - `StatsBar.tsx` — 4 colored stat cards (orange/yellow/green/blue with left borders)
   - `PendingApproval.tsx` — gold-bordered AI drafts pending approval
   - `OffersQueue.tsx` — offers awaiting response with urgency borders
   - `ActivityFeed.tsx` — recent activity deduplicated by date+subject
   - `AIEmailGenerator.tsx` — email generation panel

2. **[DONE] Built and pushed to main** - commit `1492b6b`

3. **[IN PROGRESS] Bug fixes needed**:
   - **AIEmailGenerator.tsx**: Missing property details panel (address, asking price, win-win score, strategy, agent contact info) and Level 1/2/3 offer selector above email generation buttons
   - **OffersQueue.tsx**: Showing raw property IDs (`prop_1774207452339_4dc1dxj64`) instead of addresses - needs to join properties table (FIXED: added `properties?.address` display)

## Current Plan

1. [DONE] Fix OffersQueue to show addresses (property join) — DONE
2. [TODO] Add property details panel + level selector to AIEmailGenerator.tsx
3. [TODO] Rebuild and test at https://www.gta6.miami/agent/email-closer
4. [TODO] Commit and push

### Property Data Structure (from useLocation.state)
```typescript
{
  property_id: string,
  address: string,
  city: string,
  state: string,
  listing_price: number,
  estimated_value: number,
  win_win_score: number,
  strategy: string,
  agent_name: string,
  agent_email: string,
  agent_phone: string,
  brokerage: string,
  level1_offer_price: number,
  level1_entry_fee: number,
  level1_monthly_payment: number,
  level2_offer_price: number,
  level2_entry_fee: number,
  level3_offer_price: number,
  level3_entry_fee: number,
  level3_monthly_payment: number
}
```

---

## Summary Metadata
**Update time**: 2026-05-07T01:36:59.047Z 
