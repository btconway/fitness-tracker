export type WorkoutType = 'AB_COMPLEX' | 'WALK_MOVEMENT' | 'RUCK' | 'HYPERTROPHY_PRESS' | 'RECOVERY';

export interface Exercise {
  name: string;
  reps: string;
  notes?: string;
}

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

const STANDARD_WARMUP = [
  'Hang from bar',
  'Deep squat sit',
  'Short brisk walk',
];

const STANDARD_COOLDOWN = [
  'Cool down walk: 15–30 minutes',
];

// ---- WEEKS 1-3 BASE TEMPLATE (7-day pattern) ----
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

// ---- WEEK 4 HYPERTROPHY TEMPLATE ----
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

// ---- Build the full 28-day program ----
export const ABF4FL_PROGRAM: DayPlan[] = [];
for (let week = 0; week < 4; week++) {
  const template = week < 3 ? WEEK_BASE : WEEK4_TEMPLATE;
  for (let d = 0; d < 7; d++) {
    ABF4FL_PROGRAM.push({
      ...template[d],
      dayNumber: week * 7 + d + 1,
    });
  }
}

/**
 * Get the full plan for a given cycle day (1-28).
 * Returns the correct week variation (Weeks 1-3 base, Week 4 hypertrophy).
 */
export function getFullPlanForDay(cycleDay: number): DayPlan {
  const idx = Math.max(0, Math.min(27, cycleDay - 1));
  return ABF4FL_PROGRAM[idx];
}

// ---- Fighter Pullup Program ----

export interface PullupDay {
  day: number;
  sets: number[];
  rest: boolean;
}

export const FIGHTER_3RM: PullupDay[] = [
  { day: 1, sets: [3, 2, 1, 1], rest: false },
  { day: 2, sets: [3, 2, 1, 1], rest: false },
  { day: 3, sets: [3, 2, 2, 1], rest: false },
  { day: 4, sets: [3, 3, 2, 1], rest: false },
  { day: 5, sets: [4, 3, 2, 1], rest: false },
  { day: 6, sets: [], rest: true },
  { day: 7, sets: [4, 3, 2, 1, 1], rest: false },
  { day: 8, sets: [4, 3, 2, 2, 1], rest: false },
  { day: 9, sets: [4, 3, 3, 2, 1], rest: false },
  { day: 10, sets: [4, 4, 3, 2, 1], rest: false },
  { day: 11, sets: [5, 4, 3, 2, 1], rest: false },
  { day: 12, sets: [], rest: true },
];

export const FIGHTER_5RM: PullupDay[] = [
  { day: 1, sets: [5, 4, 3, 2, 1], rest: false },
  { day: 2, sets: [5, 4, 3, 2, 2], rest: false },
  { day: 3, sets: [5, 4, 3, 3, 2], rest: false },
  { day: 4, sets: [5, 4, 4, 3, 2], rest: false },
  { day: 5, sets: [5, 5, 4, 3, 2], rest: false },
  { day: 6, sets: [], rest: true },
  { day: 7, sets: [6, 5, 4, 3, 2], rest: false },
  { day: 8, sets: [6, 5, 4, 3, 3], rest: false },
  { day: 9, sets: [6, 5, 4, 4, 3], rest: false },
  { day: 10, sets: [6, 5, 5, 4, 3], rest: false },
  { day: 11, sets: [6, 6, 5, 4, 3], rest: false },
  { day: 12, sets: [], rest: true },
  { day: 13, sets: [7, 6, 5, 4, 3], rest: false },
  { day: 14, sets: [7, 6, 5, 4, 4], rest: false },
  { day: 15, sets: [7, 6, 5, 5, 4], rest: false },
  { day: 16, sets: [7, 6, 6, 5, 4], rest: false },
  { day: 17, sets: [7, 7, 6, 5, 4], rest: false },
  { day: 18, sets: [], rest: true },
  { day: 19, sets: [8, 7, 6, 5, 4], rest: false },
  { day: 20, sets: [8, 7, 6, 5, 5], rest: false },
  { day: 21, sets: [8, 7, 6, 6, 5], rest: false },
  { day: 22, sets: [8, 7, 7, 6, 5], rest: false },
  { day: 23, sets: [8, 8, 7, 6, 5], rest: false },
  { day: 24, sets: [], rest: true },
  { day: 25, sets: [9, 8, 7, 6, 5], rest: false },
  { day: 26, sets: [9, 8, 7, 6, 6], rest: false },
  { day: 27, sets: [9, 8, 7, 7, 6], rest: false },
  { day: 28, sets: [9, 8, 8, 7, 6], rest: false },
  { day: 29, sets: [9, 9, 8, 7, 6], rest: false },
  { day: 30, sets: [], rest: true },
];

export function getFighterPullupDay(startDate: Date, targetDate: Date) {
  const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 12) {
    return { program: '3RM' as const, ...FIGHTER_3RM[diffDays - 1] };
  }

  const fiveRMDay = diffDays - 12;
  if (fiveRMDay <= 30) {
    return { program: '5RM' as const, ...FIGHTER_5RM[fiveRMDay - 1] };
  }

  return { program: 'RETEST' as const, day: diffDays, sets: [] as number[], rest: true };
}

// ---- Fighter Push-up Program (GTG) ----

export interface PushupDay {
  day: number;
  sets: number[];
  rest: boolean;
}

// Phase 1 (days 1-12): 4 sets ramping from ~45 to ~75 total reps
export const PUSHUP_GTG_PHASE1: PushupDay[] = [
  { day: 1, sets: [15, 12, 10, 8], rest: false },
  { day: 2, sets: [15, 12, 10, 10], rest: false },
  { day: 3, sets: [15, 13, 12, 10], rest: false },
  { day: 4, sets: [16, 14, 12, 10], rest: false },
  { day: 5, sets: [18, 15, 12, 10], rest: false },
  { day: 6, sets: [], rest: true },
  { day: 7, sets: [18, 15, 12, 10, 8], rest: false },
  { day: 8, sets: [18, 15, 13, 10, 8], rest: false },
  { day: 9, sets: [18, 16, 14, 12, 8], rest: false },
  { day: 10, sets: [20, 16, 14, 12, 10], rest: false },
  { day: 11, sets: [20, 18, 15, 12, 10], rest: false },
  { day: 12, sets: [], rest: true },
];

// Phase 2 (days 13-30): 5 sets ramping from ~75 to ~110 total reps
export const PUSHUP_GTG_PHASE2: PushupDay[] = [
  { day: 1, sets: [20, 18, 15, 12, 10], rest: false },
  { day: 2, sets: [20, 18, 15, 12, 12], rest: false },
  { day: 3, sets: [20, 18, 16, 14, 12], rest: false },
  { day: 4, sets: [22, 20, 16, 14, 12], rest: false },
  { day: 5, sets: [22, 20, 18, 15, 12], rest: false },
  { day: 6, sets: [], rest: true },
  { day: 7, sets: [24, 20, 18, 15, 12], rest: false },
  { day: 8, sets: [24, 22, 18, 15, 12], rest: false },
  { day: 9, sets: [24, 22, 20, 16, 14], rest: false },
  { day: 10, sets: [25, 22, 20, 18, 14], rest: false },
  { day: 11, sets: [25, 22, 20, 18, 15], rest: false },
  { day: 12, sets: [], rest: true },
  { day: 13, sets: [25, 22, 20, 18, 16], rest: false },
  { day: 14, sets: [25, 24, 20, 18, 16], rest: false },
  { day: 15, sets: [25, 24, 22, 20, 16], rest: false },
  { day: 16, sets: [28, 24, 22, 20, 16], rest: false },
  { day: 17, sets: [28, 25, 22, 20, 18], rest: false },
  { day: 18, sets: [], rest: true },
];

export function getFighterPushupDay(startDate: Date, targetDate: Date) {
  const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 12) {
    return { program: 'Phase 1' as const, ...PUSHUP_GTG_PHASE1[diffDays - 1] };
  }

  const phase2Day = diffDays - 12;
  if (phase2Day <= 18) {
    return { program: 'Phase 2' as const, ...PUSHUP_GTG_PHASE2[phase2Day - 1] };
  }

  return { program: 'MAINTAIN' as const, day: diffDays, sets: [25, 22, 20, 18, 15] as number[], rest: false };
}
