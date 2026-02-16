# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on localhost:3000
pnpm build        # Production build
pnpm lint         # Run ESLint (flat config, Next.js core-web-vitals + TypeScript rules)
```

No test framework is configured.

## Architecture

This is a **Next.js 16** App Router application for tracking fitness workouts, specifically Dan John's "Armor Building" (ABF4FL) 28-day training program with a Fighter Pullup Program overlay.

**Tech stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS 4, Neon serverless PostgreSQL, pnpm

### Key directories

- `src/app/(dashboard)/` — Route group with shared layout (Header + BottomNav + content area)
  - `page.tsx` — Today view: workout card, pullup card, quick-log buttons, steps/weight inputs
  - `calendar/page.tsx` — Calendar month grid with colored dots per log type
  - `progress/page.tsx` — Stats, charts (weight/rounds), lifetime totals, recent logs
  - `layout.tsx` — Shell: sticky header, scrollable content, fixed bottom nav, database-not-configured guard
- `src/app/api/log/route.ts` — Single API route handling POST/GET/DELETE/PATCH for the `fitness_logs` table. GET supports `?month=YYYY-MM` filter.
- `src/lib/types.ts` — Shared `FitnessLog` interface and `LogType` type alias.
- `src/lib/date.ts` — CST date utilities: `getTodayCST()`, `getNowCST()`, `getCycleDay()`, `getCycleWeek()`, date serialization helpers.
- `src/lib/data.ts` — Server-side data fetching: `fetchAllLogs()`, `fetchLogsByMonth()`, `getTodayContext()`, `computeMetrics()`.
- `src/lib/db.ts` — Neon SQL client setup. Exports `sql` (nullable if DATABASE_URL missing), `isDatabaseConfigured()`, and `initDb()`.
- `src/lib/program.ts` — Full 28-day program: Weeks 1-3 (AB Complex) + Week 4 (Hypertrophy Press). Exports `ABF4FL_PROGRAM`, `getFullPlanForDay()`, `getFighterPullupDay()`.
- `src/components/shell/` — `BottomNav.tsx` (client, fixed bottom tab bar), `Header.tsx` (server, sticky top bar with day/week counter)
- `src/components/today/` — `TodayWorkout.tsx`, `FighterPullup.tsx`, `QuickLog.tsx`, `StepsLogger.tsx`, `TodayProgress.tsx`
- `src/components/calendar/` — `CalendarGrid.tsx` (client, month grid with navigation), `DayDetail.tsx` (client, bottom sheet for day logs)
- `src/components/progress/` — `StatCard.tsx`, `WeightChart.tsx`, `RoundsChart.tsx`
- `src/components/logging/LogSheet.tsx` — FAB + full-form bottom sheet for edge-case logging
- `src/components/ui/` — `card.tsx` (Card components), `bottom-sheet.tsx` (slide-up overlay)

### Database

Raw SQL via `@neondatabase/serverless` (no ORM). Single `fitness_logs` table with columns: `id`, `created_at`, `date`, `type`, `value`, `rounds`, `pullup_sets`, `pushup_sets`, `note`. Schema auto-created/migrated in `initDb()`. Always check `isDatabaseConfigured() && sql` before queries.

### Patterns to follow

- **Server vs client components:** Default to server components. Only use `'use client'` when React hooks or browser APIs are needed.
- **Date handling:** All date math uses CST (America/Chicago) via utilities in `src/lib/date.ts`. Dates stored as `YYYY-MM-DD` strings in the DB. Always serialize Date objects to strings before returning from server components to prevent React hydration errors.
- **Program day calculation:** ABC cycle Day 1 = Feb 16, 2026. The ABF4FL program cycles every 28 days (Weeks 1-3 base, Week 4 hypertrophy). Fighter Pullup/Pushup programs start Feb 12, 2026 (linear day count): days 1-12 = 3RM phase, days 13-42 = 5RM phase, then retest.
- **API pattern:** All CRUD goes through `/api/log`. Client components use `fetch()` then `router.refresh()` (not `window.location.reload()`).
- **Naming:** Components PascalCase, functions camelCase, constants UPPER_SNAKE_CASE.
- **Path alias:** `@/*` maps to `./src/*`.
- **Mobile-first design:** Default styles target phones (375px+), `md:` for tablets/desktop. Bottom nav with safe-area-inset support. All tap targets 44px+.

### Environment

Requires `DATABASE_URL` (Neon PostgreSQL connection string) in `.env.local` or Vercel env vars. The app gracefully shows a setup guide if missing.

Deployed on Vercel.
