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
  stepsGoal: number;
  notes: string;
  roundsRange?: [number, number];
}

// ---- WEEKS 1-3 BASE TEMPLATE (7-day pattern) ----
const WEEK_BASE: Omit<DayPlan, 'dayNumber'>[] = [
  {
    type: 'AB_COMPLEX',
    title: 'AB Complex + Farmer Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Farmer Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'Focus on form.',
    roundsRange: [3, 5],
  },
  {
    type: 'WALK_MOVEMENT',
    title: 'Walk + Movement Only',
    exercises: [],
    stepsGoal: 10000,
    notes: '45-60 min walk, ideally fasted. Mobility: Original Strength/foam rolling.',
  },
  {
    type: 'AB_COMPLEX',
    title: 'AB Complex + Suitcase Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Suitcase Carries: 2-4 rounds (switch hands)',
    stepsGoal: 10000,
    notes: 'Build volume.',
    roundsRange: [5, 10],
  },
  {
    type: 'RUCK',
    title: 'Optional Ruck',
    exercises: [],
    stepsGoal: 10000,
    notes: '30-45 min ruck (5-30 lbs). Focus on posture.',
  },
  {
    type: 'AB_COMPLEX',
    title: 'AB Complex + Racked Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Racked Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'Push the pace.',
    roundsRange: [5, 10],
  },
  {
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or total off day. Get the steps.',
  },
  {
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Reflect: Did I walk? Did I train? Did I eat like an adult?',
  },
];

// ---- WEEK 4 HYPERTROPHY TEMPLATE ----
const WEEK4_TEMPLATE: Omit<DayPlan, 'dayNumber'>[] = [
  {
    type: 'HYPERTROPHY_PRESS',
    title: 'Press Ladder + Farmer Carries',
    exercises: [
      { name: 'KB Press Ladder', reps: '2-3-5-10', notes: 'Up to 3 ladders' },
    ],
    carries: 'Farmer Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'Press ladder: 2, 3, 5, 10 reps. Repeat up to 3x.',
    roundsRange: [1, 3],
  },
  {
    type: 'WALK_MOVEMENT',
    title: 'Walk + Movement Only',
    exercises: [],
    stepsGoal: 10000,
    notes: '45-60 min walk, ideally fasted. Mobility: Original Strength/foam rolling.',
  },
  {
    type: 'AB_COMPLEX',
    title: 'AB Complex (High Volume) + Racked Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' },
    ],
    carries: 'Racked Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'High volume day. Push for max rounds.',
    roundsRange: [10, 30],
  },
  {
    type: 'RUCK',
    title: 'Optional Ruck',
    exercises: [],
    stepsGoal: 10000,
    notes: '30-45 min ruck (5-30 lbs). Focus on posture.',
  },
  {
    type: 'HYPERTROPHY_PRESS',
    title: 'High Rep Pressing + Suitcase Carries',
    exercises: [
      { name: 'KB Press Ladder', reps: '2-3-5-10', notes: 'Up to 5 ladders' },
    ],
    carries: 'Suitcase Carries: 2-4 rounds (switch hands)',
    stepsGoal: 10000,
    notes: 'Press ladder: 2, 3, 5, 10 reps. Repeat up to 5x.',
    roundsRange: [1, 5],
  },
  {
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or total off day. Get the steps.',
  },
  {
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Reflect: Did I walk? Did I train? Did I eat like an adult?',
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
