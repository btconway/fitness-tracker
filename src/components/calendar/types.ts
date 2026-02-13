import type { DayPlan } from '@/lib/program';
import type { FitnessLog } from '@/lib/types';

export type Status = 'none' | 'partial' | 'done';

export interface DayStatus {
  workout: Status;
  steps: Status;
  pullups: Status;
  pushups: Status;
  weight: Status;
}

export interface DayInfo {
  date: string;
  cycleDay: number;
  cycleWeek: number;
  plan: DayPlan;
  pullupDay: { program: string; day: number; sets: number[]; rest: boolean };
  pushupDay: { program: string; day: number; sets: number[]; rest: boolean };
  logs: FitnessLog[];
  status: DayStatus;
  isFuture: boolean;
  isToday: boolean;
  isProgramActive: boolean;
}
