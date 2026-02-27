export interface FitnessLog {
  id: number;
  created_at: string;
  date: string;
  type: 'WORKOUT' | 'STEPS' | 'WEIGHT' | 'PULLUP' | 'PUSHUP' | 'CARRIES' | 'SWING';
  value: string;
  rounds: number | null;
  pullup_sets: string | null;
  pushup_sets: string | null;
  swing_sets: string | null;
  bell_size: string | null;
  secondary_bell_size: string | null;
  secondary_rounds: number | null;
  note: string | null;
}

export type LogType = FitnessLog['type'];

export const BELL_SIZES = ['24 kg', '28 kg', '32 kg'] as const;
export type BellSize = typeof BELL_SIZES[number];
