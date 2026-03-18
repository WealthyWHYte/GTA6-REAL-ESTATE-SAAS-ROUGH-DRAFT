# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Build for production
npm run build:dev # Build in development mode
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + Supabase

**Monorepo structure:**
- `src/` - Main React application
  - `pages/` - Route components (file-based routing with `[id]` dynamic segments)
  - `components/` - UI components (shadcn in `components/ui/`, feature components in `components/`)
  - `hooks/` - Custom React hooks
  - `lib/` - Utilities (Supabase client, cn helper)
  - `api/` - API endpoints
- `supabase/` - Supabase Edge Functions (TypeScript)
- `n8n-workflows/` - n8n automation workflows (JSON)
- `email_agent/` - Python email automation scripts
- `URHUSTLEHOUSE/` - Raw data/CSV files for property leads

**Key patterns:**
- Protected routes wrap authenticated pages with Supabase session check
- All authenticated routes render with `GTAMoneyBar` component
- shadcn components live in `src/components/ui/`
- Supabase authentication handles user sessions
- Path alias `@/` resolves to `./src/` (configured in `tsconfig.json` and `vite.config.ts`)

## Environment

Required `.env.local` variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
