# Bell Progression Tracking — Design Document

**Date:** 2026-02-25

## Problem

During the Armor Building Complex transition to heavier kettlebells, sessions are often split across two bell sizes (e.g., 9 rounds @ 24 kg + 1 round @ 28 kg). The existing schema supported only a single `bell_size` per log, making it impossible to track split sessions or visualize progress toward the target (all 10 rounds @ 28 kg).

## Solution

### Schema

Two nullable columns added to `fitness_logs` via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in `initDb()`:

- `secondary_bell_size TEXT` — the heavier bell used for some rounds
- `secondary_rounds INTEGER` — number of rounds done at that heavier bell

The primary `bell_size` / `rounds` fields remain the "main" bell (the one used for most rounds).

### Data model convention

- **Split session:** `bell_size = "24 kg"`, `rounds = 9`, `secondary_bell_size = "28 kg"`, `secondary_rounds = 1`
- **Single-bell session:** `bell_size = "28 kg"`, `rounds = 10`, `secondary_bell_size = null`, `secondary_rounds = null`

### API

`POST /api/log` and `PATCH /api/log` both accept and persist `secondary_bell_size` and `secondary_rounds`.

### Logging UI

Both `TodayWorkout` and `LogSheet` gain an optional "Heavy bell" section below the primary selectors:

- A 3-button bell picker (same `BELL_SIZES` constant)
- A rounds picker / input that appears only after a secondary bell is selected
- Styled with a dashed border to indicate it is optional

### BellProgressChart

New component at `src/components/progress/BellProgressChart.tsx`:

- Filters to WORKOUT logs with a `bell_size` set; takes the last 10 (chronological order)
- Per log, computes `heavyRounds`:
  - If `secondary_bell_size` is set → `secondary_rounds`
  - Else → `rounds` (entire session was at one bell)
- Bar chart with y-axis max = 10, goal line at 10 (dashed)
- Shows bell size label and date (MM/DD) below each bar

### Progress page

`BellProgressChart` rendered after `RoundsChart`, receiving the full `logs` array already fetched.

## Trade-offs considered

- **One row vs two rows per session:** Keeping one row avoids schema complexity and query changes elsewhere. The two-column approach mirrors how `bell_size` was added previously.
- **Secondary vs primary semantics:** Secondary = the heavier bell (the progression target). Primary = the workhorse bell (most rounds). This matches the user's mental model.
- **No cap enforcement on secondary rounds:** UI trusts the user not to exceed total rounds. Validation would add complexity for minimal benefit in a personal tracking app.
