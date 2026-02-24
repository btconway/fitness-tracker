# Bell Size Selection for Armor Building Workouts

**Date:** 2026-02-24
**Status:** Approved

## Summary

Add bell size selection (24 kg / 28 kg / 32 kg) to armor building workout logging. Bell size is stored in a new `bell_size TEXT` column on the `fitness_logs` table.

## Scope

Affects workout types: `AB_COMPLEX` and `HYPERTROPHY_PRESS` only.

## Database

- Add `bell_size TEXT` column to `fitness_logs` via `ALTER TABLE ADD COLUMN IF NOT EXISTS` in `initDb()` (matches existing migration pattern for `rounds`, `pullup_sets`, `pushup_sets`).
- Update `FitnessLog` interface in `src/lib/types.ts` to include `bell_size: string | null`.

## API

- `POST /api/log`: Accept `bell_size` in request body, pass to INSERT.
- `PATCH /api/log`: Accept `bell_size` in request body, include in UPDATE.

## UI — TodayWorkout.tsx

- Add a row of three tap buttons (24 kg / 28 kg / 32 kg) above the rounds selector.
- Styled identically to existing rounds buttons (blue when selected, zinc-100 when not).
- "Log Workout" button remains disabled until both bell size and rounds are selected.
- Bell size is included in the POST payload as `bell_size`.

## UI — LogSheet.tsx

- When `type === 'WORKOUT'`, show the same three bell size buttons.
- Include `bell_size` in the POST payload.

## Display

No changes to calendar or progress views in this iteration — bell size is captured and stored but not yet surfaced in charts/history views.
