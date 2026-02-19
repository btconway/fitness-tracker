# Dan John Text + Carries Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the fitness tracker to show Dan John's exact ABF4FL program text for each workout day, and add a separate carries logging card with bell size selection (24/28/32 kg).

**Architecture:** Add `carryType` to `DayPlan` in `program.ts`, update all day text to match Dan John verbatim, add `'CARRIES'` log type, create `CarriesLogger` component as a new card rendered between TodayWorkout and FighterPullup on days with carries.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Neon PostgreSQL. No test framework. Verify with `pnpm build` and visual check in browser.

**Current state (Day 3 = Feb 18, 2026):** AB Complex + Suitcase Carries (rounds 5–10, suitcase carries 2–4 rounds).

---

### Task 1: Add `carryType` to `DayPlan` and update `program.ts` with Dan John's exact text

**Files:**
- Modify: `src/lib/program.ts`

**Step 1: Update the `DayPlan` interface**

In `src/lib/program.ts`, add `carryType` to the interface:

```typescript
export interface DayPlan {
  dayNumber: number;
  type: WorkoutType;
  title: string;
  exercises: Exercise[];
  carries?: string;
  carryType?: 'FARMER' | 'SUITCASE' | 'RACKED';
  stepsGoal: number;
  notes: string;
  roundsRange?: [number, number];
  warmup?: string[];
  cooldown?: string[];
  detailedNotes?: string;
}
```

**Step 2: Update STANDARD_WARMUP and STANDARD_COOLDOWN constants**

Replace:
```typescript
const STANDARD_WARMUP = [
  'Hang from bar (30-60s)',
  'Deep goblet squat sit (2-3 min)',
  'Short brisk walk (5 min)',
];

const STANDARD_COOLDOWN = [
  'Cool down walk: 15-30 minutes',
];
```

With:
```typescript
const STANDARD_WARMUP = [
  'Hang from bar',
  'Deep squat sit',
  'Short brisk walk',
];

const STANDARD_COOLDOWN = [
  'Cool down walk: 15–30 minutes',
];
```

**Step 3: Replace WEEK_BASE with updated Dan John text + carryType fields**

Replace the entire `WEEK_BASE` array with:

```typescript
const WEEK_BASE: Omit<DayPlan, 'dayNumber'>[] = [
  {
    // Day 1: AB Complex + Farmer Carries
    type: 'AB_COMPLEX',
    title: 'Armor Building Complex + Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Farmer Carries: 3 x 40 yards',
    carryType: 'FARMER',
    stepsGoal: 10000,
    notes: 'Strive for 10,000 steps a day.',
    roundsRange: [3, 5],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Day 2: Walk + Movement Only
    type: 'WALK_MOVEMENT',
    title: 'Walk + Movement Only',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Walk: 45–60 minutes, ideally fasted. Mobility: Original Strength, foam rolling, floor work. Optional: Light swings or band work. Strive for 10,000 steps a day. This is the daily total, strive to get 3,000 to 5,000 in that morning walk.',
  },
  {
    // Day 3: AB Complex + Suitcase Carries
    type: 'AB_COMPLEX',
    title: 'Armor Building Complex + Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Suitcase Carries: Down with one hand; back with the other, 2–4 rounds',
    carryType: 'SUITCASE',
    stepsGoal: 10000,
    notes: 'Strive for 10,000 steps a day.',
    roundsRange: [5, 10],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Day 4: Optional Ruck
    type: 'RUCK',
    title: 'Optional Ruck',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Walk for 30–45 minutes, focus on posture and breathing. Strive for 10,000 steps a day.',
  },
  {
    // Day 5: AB Complex + Racked Carries
    type: 'AB_COMPLEX',
    title: 'Armor Building Complex + Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Racked Carries: 3 x 40 yards',
    carryType: 'RACKED',
    stepsGoal: 10000,
    notes: 'Strive for 10,000 steps a day.',
    roundsRange: [5, 10],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Day 6: Rebuild + Reflection
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or Total Off Day but still get those steps in! Reflect: Did I walk? Did I train? Did I eat like an adult? This is designed, originally, for someone who has very busy Monday mornings. Feel free to add more rounds each week, but strive to keep the calories in check and the steps before chasing gains in the weight room.',
  },
  {
    // Day 7: Rebuild + Reflection
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or Total Off Day but still get those steps in! Reflect: Did I walk? Did I train? Did I eat like an adult? This is designed, originally, for someone who has very busy Monday mornings. Feel free to add more rounds each week, but strive to keep the calories in check and the steps before chasing gains in the weight room.',
  },
];
```

**Step 4: Replace WEEK4_TEMPLATE with updated Dan John text + carryType fields**

Replace the entire `WEEK4_TEMPLATE` array with:

```typescript
const WEEK4_TEMPLATE: Omit<DayPlan, 'dayNumber'>[] = [
  {
    // Week 4, Day 1: High Rep Pressing + Farmer Carries
    type: 'HYPERTROPHY_PRESS',
    title: 'High Rep Pressing + Carries',
    exercises: [
      { name: 'Double KB Press Ladder', reps: '2–3–5–10', notes: 'Repeat up to 3 times. Feel free to adjust presses, dropping the 10s or changing loads, as appropriate.' },
    ],
    carries: 'Farmer Carries: 3 x 40 yards',
    carryType: 'FARMER',
    stepsGoal: 10000,
    notes: 'Daily goal: 10,000 steps.',
    roundsRange: [1, 3],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Week 4, Day 2: Walk + Movement Only
    type: 'WALK_MOVEMENT',
    title: 'Walk + Movement Only',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Walk: 45–60 minutes, ideally fasted. Mobility: Original Strength, foam rolling, floor work. Optional: Light swings or band work. Daily goal: 10,000 steps.',
  },
  {
    // Week 4, Day 3: AB Complex (High Volume) + Racked Carries
    type: 'AB_COMPLEX',
    title: 'Armor Building Complex + Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Racked Carries: 3 x 40 yards',
    carryType: 'RACKED',
    stepsGoal: 10000,
    notes: 'Repeat 10–30 rounds as appropriate. Daily goal: 10,000 steps.',
    roundsRange: [10, 30],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Week 4, Day 4: Optional Ruck
    type: 'RUCK',
    title: 'Optional Ruck',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Light pack (20–30 lbs). Walk: 30–45 minutes, focus on posture and breathing. Daily goal: 10,000 steps.',
  },
  {
    // Week 4, Day 5: High Rep Pressing + Suitcase Carries
    type: 'HYPERTROPHY_PRESS',
    title: 'High Rep Pressing + Carries',
    exercises: [
      { name: 'Double KB Press Ladder', reps: '2–3–5–10', notes: 'Repeat up to 5 times.' },
    ],
    carries: 'Suitcase Carries: Down with one hand; back with the other, 2–4 rounds',
    carryType: 'SUITCASE',
    stepsGoal: 10000,
    notes: 'Daily goal: 10,000 steps.',
    roundsRange: [1, 5],
    warmup: STANDARD_WARMUP,
    cooldown: STANDARD_COOLDOWN,
  },
  {
    // Week 4, Day 6: Rebuild + Reflection
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or total off day, but still hit your step count. Reflect: Did I walk? Did I train? Did I eat like an adult? Strive to dial in daily calories, the walking, and the lifting program. If you feel the need to "add more," first see if you are actually eating your calorie numbers and getting in the steps. You can NOT out train bad choices in food consumption!',
  },
  {
    // Week 4, Day 7: Rebuild + Reflection
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or total off day, but still hit your step count. Reflect: Did I walk? Did I train? Did I eat like an adult? Strive to dial in daily calories, the walking, and the lifting program. If you feel the need to "add more," first see if you are actually eating your calorie numbers and getting in the steps. You can NOT out train bad choices in food consumption!',
  },
];
```

**Step 5: Verify build**

```bash
cd /Users/benconway/GitHub/fitness-tracker && pnpm build 2>&1 | tail -20
```

Expected: No TypeScript errors (the new `carryType` field is optional so no downstream breakage).

**Step 6: Commit**

```bash
cd /Users/benconway/GitHub/fitness-tracker
git add src/lib/program.ts
git commit -m "feat: update program text to match Dan John ABF4FL verbatim, add carryType field"
```

---

### Task 2: Add `'CARRIES'` log type and update `data.ts`

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/data.ts`

**Step 1: Add 'CARRIES' to LogType in `types.ts`**

Change:
```typescript
export interface FitnessLog {
  ...
  type: 'WORKOUT' | 'STEPS' | 'WEIGHT' | 'PULLUP' | 'PUSHUP';
  ...
}
```
To:
```typescript
export interface FitnessLog {
  ...
  type: 'WORKOUT' | 'STEPS' | 'WEIGHT' | 'PULLUP' | 'PUSHUP' | 'CARRIES';
  ...
}
```

**Step 2: Add `todayCarries` to `getTodayContext()` in `data.ts`**

In the `getTodayContext()` function, after the existing `todayPushups` block, add:

```typescript
const todayCarries = todayLogs.find(l => l.type === 'CARRIES') ?? null;
```

Then add `todayCarries` to the returned object:
```typescript
return {
  todayStr,
  cycleDay,
  plan,
  pullupDay,
  pushupDay,
  todayWorkout,
  todaySteps,
  todayWeight,
  todayPullupSets,
  todayPullupTotal,
  todayPushupSets,
  todayPushupTotal,
  todayCarries,
  lastWeight,
  logs,
};
```

**Step 3: Verify build**

```bash
cd /Users/benconway/GitHub/fitness-tracker && pnpm build 2>&1 | tail -20
```

Expected: No errors.

**Step 4: Commit**

```bash
cd /Users/benconway/GitHub/fitness-tracker
git add src/lib/types.ts src/lib/data.ts
git commit -m "feat: add CARRIES log type and todayCarries to context"
```

---

### Task 3: Create `CarriesLogger` component

**Files:**
- Create: `src/components/today/CarriesLogger.tsx`

**Step 1: Create the component**

Create `src/components/today/CarriesLogger.tsx` with this content:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { FitnessLog } from '@/lib/types';

const BELL_SIZES = ['24 kg', '28 kg', '32 kg'] as const;
type BellSize = typeof BELL_SIZES[number];

interface Props {
  carryDescription: string;   // e.g. "Suitcase Carries: Down with one hand; back with the other, 2–4 rounds"
  carryType: 'FARMER' | 'SUITCASE' | 'RACKED';
  todayStr: string;
  alreadyLogged: FitnessLog | null;
}

export function CarriesLogger({ carryDescription, carryType, todayStr, alreadyLogged }: Props) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<BellSize | null>(
    alreadyLogged ? (alreadyLogged.value as BellSize) : null
  );
  const [isLogging, setIsLogging] = useState(false);

  const carryLabel = carryType === 'FARMER' ? 'Farmer Carries'
    : carryType === 'SUITCASE' ? 'Suitcase Carries'
    : 'Racked Carries';

  async function handleLog() {
    if (isLogging || !selectedSize) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'CARRIES',
          value: selectedSize,
          note: carryLabel,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log carries');
    } catch {
      alert('Error logging carries');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-orange-400 p-4 relative">
      {alreadyLogged && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}

      <h3 className="font-semibold text-slate-800 text-sm mb-2">{carryLabel}</h3>
      <p className="text-xs text-slate-600 bg-zinc-50 rounded-lg px-3 py-2 mb-3">
        {carryDescription}
      </p>

      {alreadyLogged ? (
        <p className="text-xs text-emerald-600 font-medium">
          Logged with {alreadyLogged.value}
        </p>
      ) : (
        <>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Bell Size</p>
          <div className="flex gap-2 mb-3">
            {BELL_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
                  selectedSize === size
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            onClick={handleLog}
            disabled={isLogging || !selectedSize}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {isLogging ? 'Logging...' : 'Log Carries'}
          </button>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
cd /Users/benconway/GitHub/fitness-tracker && pnpm build 2>&1 | tail -20
```

Expected: No errors.

**Step 3: Commit**

```bash
cd /Users/benconway/GitHub/fitness-tracker
git add src/components/today/CarriesLogger.tsx
git commit -m "feat: add CarriesLogger component with bell size selector"
```

---

### Task 4: Wire `CarriesLogger` into the today page

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

**Step 1: Update page.tsx to import CarriesLogger and render it**

Add the import at the top of the file (after existing imports):
```typescript
import { CarriesLogger } from '@/components/today/CarriesLogger';
```

Update destructuring to include `todayCarries`:
```typescript
const {
  todayStr,
  plan,
  pullupDay,
  pushupDay,
  todayWorkout,
  todaySteps,
  todayWeight,
  todayPullupSets,
  todayPullupTotal,
  todayPushupSets,
  todayPushupTotal,
  todayCarries,
  lastWeight,
} = ctx;
```

Insert `CarriesLogger` between `TodayWorkout` and `FighterPullup`, but only when the plan has a carry:

```tsx
<TodayWorkout
  plan={plan}
  todayStr={todayStr}
  alreadyLogged={!!todayWorkout}
/>

{plan.carryType && plan.carries && (
  <CarriesLogger
    carryDescription={plan.carries}
    carryType={plan.carryType}
    todayStr={todayStr}
    alreadyLogged={todayCarries}
  />
)}

<FighterPullup
  pullupDay={pullupDay}
  todayStr={todayStr}
  todaySets={todayPullupSets}
  todayTotal={todayPullupTotal}
/>
```

**Step 2: Verify build**

```bash
cd /Users/benconway/GitHub/fitness-tracker && pnpm build 2>&1 | tail -20
```

Expected: Clean build, no TypeScript errors.

**Step 3: Commit**

```bash
cd /Users/benconway/GitHub/fitness-tracker
git add src/app/(dashboard)/page.tsx
git commit -m "feat: render CarriesLogger on days with carries"
```

---

### Task 5: Visual check in browser

**Step 1: Start dev server**

```bash
cd /Users/benconway/GitHub/fitness-tracker && pnpm dev
```

**Step 2: Open browser and verify Day 3 (today)**

Navigate to `http://localhost:3000`. Check:
- [ ] Workout card shows "Armor Building Complex + Carries" with Dan John's exact warmup, exercises, "Repeat 5–10 rounds", and cooldown
- [ ] Carries card shows "Suitcase Carries" with description "Down with one hand; back with the other, 2–4 rounds"
- [ ] Bell size buttons show "24 kg", "28 kg", "32 kg"
- [ ] Tapping a bell size highlights it in orange
- [ ] "Log Carries" button is disabled until a size is selected
- [ ] After logging, a green checkmark appears and shows "Logged with XX kg"
- [ ] On a non-carries day (e.g., Day 2 or Day 4), the CarriesLogger card does not appear

**Step 3: Done. No further commits needed.**
