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
