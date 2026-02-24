# Bell Size Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 24 kg / 28 kg / 32 kg bell size selector to armor building workout logging, storing the selection in a new `bell_size` DB column.

**Architecture:** New `bell_size TEXT` column on `fitness_logs`, auto-migrated in `initDb()`. API route updated to accept/persist the field. `TodayWorkout` and `LogSheet` get tap-button selectors styled to match existing rounds buttons.

**Tech Stack:** Next.js 16 App Router, TypeScript (strict), Tailwind CSS 4, Neon serverless PostgreSQL (`@neondatabase/serverless`), pnpm

> **Note:** No test framework is configured in this project. Skip all test steps. Verify changes by running `pnpm build` and manual browser testing with `pnpm dev`.

---

### Task 1: DB migration + type update

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/lib/types.ts`

**Step 1: Add `bell_size` column migration to `initDb()`**

In `src/lib/db.ts`, after the existing `pushup_sets` migration block (around line 63), add:

```ts
// Add bell_size column if it doesn't exist (migration)
try {
  await sql`ALTER TABLE fitness_logs ADD COLUMN IF NOT EXISTS bell_size TEXT`;
} catch {
  // Column might already exist, ignore error
}
```

**Step 2: Add `bell_size` to `FitnessLog` interface**

In `src/lib/types.ts`, add the field after `pushup_sets`:

```ts
export interface FitnessLog {
  id: number;
  created_at: string;
  date: string;
  type: 'WORKOUT' | 'STEPS' | 'WEIGHT' | 'PULLUP' | 'PUSHUP' | 'CARRIES';
  value: string;
  rounds: number | null;
  pullup_sets: string | null;
  pushup_sets: string | null;
  bell_size: string | null;
  note: string | null;
}
```

**Step 3: Verify build passes**

```bash
pnpm build
```
Expected: Build succeeds with no TypeScript errors.

**Step 4: Commit**

```bash
git add src/lib/db.ts src/lib/types.ts
git commit -m "feat: add bell_size column migration and type"
```

---

### Task 2: API route — accept bell_size in POST and PATCH

**Files:**
- Modify: `src/app/api/log/route.ts`

**Step 1: Update POST handler to read and insert `bell_size`**

In the `POST` handler, the destructure line (line 14) becomes:

```ts
const { date, type, value, note, rounds, pullup_sets, pushup_sets, bell_size } = data;
```

And the INSERT (line 17) becomes:

```ts
await sql`INSERT INTO fitness_logs (date, type, value, rounds, pullup_sets, pushup_sets, bell_size, note)
  VALUES (${date}, ${type}, ${value}, ${rounds || null}, ${pullup_sets || null}, ${pushup_sets || null}, ${bell_size || null}, ${note})`;
```

**Step 2: Update PATCH handler to include `bell_size`**

In the `PATCH` handler, the destructure (line 91) becomes:

```ts
const { id, rounds, note, bell_size } = data;
```

And the UPDATE (line 97) becomes:

```ts
await sql`UPDATE fitness_logs SET rounds = ${rounds || null}, note = ${note || null}, bell_size = ${bell_size || null} WHERE id = ${id}`;
```

**Step 3: Verify build passes**

```bash
pnpm build
```
Expected: No errors.

**Step 4: Commit**

```bash
git add src/app/api/log/route.ts
git commit -m "feat: persist bell_size in POST and PATCH API handlers"
```

---

### Task 3: TodayWorkout — bell size selector UI

**Files:**
- Modify: `src/components/today/TodayWorkout.tsx`

**Context:** This component already has a `selectedRounds` state and tap-button selector for rounds. We add parallel `selectedBell` state and a 3-button selector for bell sizes. Both must be selected to enable "Log Workout". Bell size is sent in the POST body.

**Step 1: Add state and constants**

After the existing `const [isLogging, setIsLogging] = useState(false);` line, add:

```ts
const [selectedBell, setSelectedBell] = useState<string | null>(null);

const BELL_SIZES = ['24 kg', '28 kg', '32 kg'];
```

**Step 2: Include `bell_size` in the POST payload**

In `handleLog`, update the `body` JSON to include bell_size:

```ts
body: JSON.stringify({
  date: todayStr,
  type: 'WORKOUT',
  value: 'COMPLETED',
  rounds: selectedRounds,
  bell_size: selectedBell,
  note: null,
}),
```

**Step 3: Add bell size selector above rounds selector**

Locate the block that starts with `{hasRounds && !alreadyLogged && (` (around line 122). Add the bell size buttons as the first element inside that fragment, before the rounds buttons div:

```tsx
{hasRounds && !alreadyLogged && (
  <>
    <div className="flex gap-2 mb-3">
      {BELL_SIZES.map(size => (
        <button
          key={size}
          onClick={() => setSelectedBell(size)}
          className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
            selectedBell === size
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
    <div className="flex gap-2 mb-3 flex-wrap">
      {/* existing rounds buttons */}
    </div>
    <button
      onClick={handleLog}
      disabled={isLogging || !selectedRounds || !selectedBell}
      ...
    >
```

> Important: The "Log Workout" button's `disabled` condition must be updated to `isLogging || !selectedRounds || !selectedBell`.

**Step 4: Verify build passes**

```bash
pnpm build
```
Expected: No errors.

**Step 5: Manual test**

Run `pnpm dev` and open http://localhost:3000. On a day with AB_COMPLEX or HYPERTROPHY_PRESS:
- Confirm three bell size buttons appear above the rounds buttons
- Confirm "Log Workout" is disabled until both bell and rounds are selected
- Log a workout and verify it succeeds (no error alert)

**Step 6: Commit**

```bash
git add src/components/today/TodayWorkout.tsx
git commit -m "feat: add bell size selector to TodayWorkout"
```

---

### Task 4: LogSheet — bell size selector for WORKOUT type

**Files:**
- Modify: `src/components/logging/LogSheet.tsx`

**Context:** The fallback log form in the FAB sheet. When `type === 'WORKOUT'` it currently shows a rounds number input. We add bell size tap buttons below the rounds input.

**Step 1: Add `bellSize` state**

After the existing `const [pushupSets, setPushupSets] = useState('');` line, add:

```ts
const [bellSize, setBellSize] = useState('');

const BELL_SIZES = ['24 kg', '28 kg', '32 kg'];
```

**Step 2: Reset `bellSize` in the `reset()` function**

```ts
function reset() {
  setRounds('');
  setSteps('');
  setWeight('');
  setPullupSets('');
  setPushupSets('');
  setBellSize('');
  setNote('');
}
```

**Step 3: Include `bell_size` in POST payload**

In `handleSubmit`, after `if (type === 'WORKOUT' && rounds) payload.rounds = parseInt(rounds);`, add:

```ts
if (type === 'WORKOUT' && bellSize) payload.bell_size = bellSize;
```

**Step 4: Add bell size buttons inside the WORKOUT section**

The existing `{type === 'WORKOUT' && (...)}` block shows a rounds input. Add bell size buttons after it (as a sibling conditional block, not nested):

```tsx
{type === 'WORKOUT' && (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">Bell Size</label>
    <div className="flex gap-2">
      {BELL_SIZES.map(size => (
        <button
          key={size}
          type="button"
          onClick={() => setBellSize(size)}
          className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
            bellSize === size
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
)}
```

> Place this block immediately after the existing rounds input block (after the closing `)}` of `{type === 'WORKOUT' && (...rounds input...)}`).

**Step 5: Verify build passes**

```bash
pnpm build
```
Expected: No errors.

**Step 6: Manual test**

Open the FAB (+) sheet, select type "Workout", confirm bell size buttons appear and selection highlights correctly.

**Step 7: Commit**

```bash
git add src/components/logging/LogSheet.tsx
git commit -m "feat: add bell size selector to LogSheet"
```
