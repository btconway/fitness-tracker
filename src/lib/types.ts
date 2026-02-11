export interface FitnessLog {
  id: number;
  created_at: string;
  date: string;
  type: 'WORKOUT' | 'STEPS' | 'WEIGHT' | 'PULLUP' | 'PUSHUP';
  value: string;
  rounds: number | null;
  pullup_sets: string | null;
  pushup_sets: string | null;
  note: string | null;
}

export type LogType = FitnessLog['type'];
