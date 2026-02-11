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
}

export const ABF4FL_PROGRAM: DayPlan[] = [
  // WEEK 1
  {
    dayNumber: 1,
    type: 'AB_COMPLEX',
    title: 'AB Complex + Farmer Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' }
    ],
    carries: 'Farmer Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'Repeat 3–5 rounds. Focus on form.'
  },
  {
    dayNumber: 2,
    type: 'WALK_MOVEMENT',
    title: 'Walk + Movement Only',
    exercises: [],
    stepsGoal: 10000,
    notes: '45–60 min walk, ideally fasted. Mobility: Original Strength/foam rolling.'
  },
  {
    dayNumber: 3,
    type: 'AB_COMPLEX',
    title: 'AB Complex + Suitcase Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' }
    ],
    carries: 'Suitcase Carries: 2-4 rounds (switch hands)',
    stepsGoal: 10000,
    notes: 'Repeat 5-10 rounds.'
  },
  {
    dayNumber: 4,
    type: 'RUCK',
    title: 'Optional Ruck',
    exercises: [],
    stepsGoal: 10000,
    notes: '30–45 min ruck (5–30 lbs). Focus on posture.'
  },
  {
    dayNumber: 5,
    type: 'AB_COMPLEX',
    title: 'AB Complex + Racked Carries',
    exercises: [
      { name: 'Double KB Clean', reps: '2' },
      { name: 'Double KB Press', reps: '1' },
      { name: 'Front Squat', reps: '3' }
    ],
    carries: 'Racked Carries: 3 x 40 yards',
    stepsGoal: 10000,
    notes: 'Repeat 5-10 rounds.'
  },
  {
    dayNumber: 6,
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Active recovery or total off day. Get the steps.'
  },
  {
    dayNumber: 7,
    type: 'RECOVERY',
    title: 'Rebuild + Reflection',
    exercises: [],
    stepsGoal: 10000,
    notes: 'Reflect: Did I walk? Did I train? Did I eat like an adult?'
  },
  // WEEKS 2-3 mirror WEEK 1 logic with round increases... 
  // WEEK 4 shifts to Hypertrophy
];

export function getPlanForDate(startDate: Date, targetDate: Date) {
  const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % 28) + 1; // 28 day program cycle
  
  // Logic to return specific Week 4 variation if cycleDay > 21
  return cycleDay;
}

// Fighter Pullup Program types
export interface PullupDay {
  day: number;
  sets: number[];
  rest: boolean;
}

// 3RM Fighter Pullup Program (Days 1-12)
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
  { day: 12, sets: [], rest: true }
];

// 5RM Fighter Pullup Program (Days 1-30)
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
  { day: 30, sets: [], rest: true }
];

export function getFighterPullupDay(startDate: Date, targetDate: Date) {
  const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Day 1 = start date
  
  // Days 1-12: 3RM program
  if (diffDays <= 12) {
    return { program: '3RM', ...FIGHTER_3RM[diffDays - 1] };
  }
  
  // Days 13+: 5RM program (reset to day 1 of 5RM after 3RM completes)
  const fiveRMDay = diffDays - 12;
  if (fiveRMDay <= 30) {
    return { program: '5RM', ...FIGHTER_5RM[fiveRMDay - 1] };
  }
  
  // After completing both programs (42 days total), suggest retest
  return { program: 'RETEST', day: diffDays, sets: [], rest: true };
}
