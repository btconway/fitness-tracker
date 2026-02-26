# Rest Timer Design — 2026-02-25

## Problem

After logging a pull-up or push-up set, there's no way to track how much rest time has elapsed. During GTG-style training (many sets throughout the day), knowing the elapsed time since the last set is useful for pacing.

## Outcome

A count-up timer appears in each card (FighterPullup, FighterPushup) below the set buttons, showing time elapsed since the last logged set of that type (e.g., `"2:34 since last set"`). Hidden when no sets have been logged today.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Timer type | Count-up | Shows how long ago you logged; no target rest period needed |
| State source | DB `created_at` | Persists across refreshes; no extra state management |
| Scope | Separate per card | Pullups and pushups are independent GTG programs |
| Reset mechanism | `router.refresh()` (existing) | New log updates server data → new `lastSetAt` prop → effect re-runs |

## Architecture

No new files, DB columns, or API routes. The existing `created_at` timestamp on each log row is the reference point.

Data flows server → client:

```
getTodayContext() [data.ts]
  todayPullups[0].created_at → lastPullupAt
  todayPushups[0].created_at → lastPushupAt
    ↓ props
page.tsx
  → FighterPullup(lastSetAt={lastPullupAt})
  → FighterPushup(lastSetAt={lastPushupAt})
    ↓ useEffect
  setInterval(1000): elapsed = floor((Date.now() - new Date(lastSetAt)) / 1000)
```

## Components Changed

- `src/lib/data.ts` — add `lastPullupAt` and `lastPushupAt` to `getTodayContext()` return
- `src/app/(dashboard)/page.tsx` — destructure and pass new props to both cards
- `src/components/today/FighterPullup.tsx` — add `lastSetAt` prop, `useState`/`useEffect` for elapsed, timer display
- `src/components/today/FighterPushup.tsx` — same as FighterPullup

## Timer Display

Below the set-buttons `div`, above the progress text:

```tsx
{lastSetAt && (
  <p className="text-xs text-slate-400 text-center mt-[-4px] mb-2">
    {formatElapsed(elapsedSeconds)} since last set
  </p>
)}
```

Where `formatElapsed(s)` → `"M:SS"` format, defined as a module-level helper.

## Edge Cases

- No sets today → `lastSetAt` is null → timer hidden
- All sets done → timer continues (still useful)
- `created_at` is UTC ISO string; `Date.now()` is also UTC — no timezone math needed
- `useEffect` returns `clearInterval` cleanup to prevent memory leaks
