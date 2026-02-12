import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Match logged reps against prescribed sets using greedy matching.
 * Returns the set of prescribed indices that have been completed.
 * Handles duplicate rep values correctly by consuming each logged rep once.
 */
export function getCompletedSetIndices(prescribed: number[], logged: number[]): Set<number> {
  const completed = new Set<number>();
  const remaining = [...logged];

  for (let i = 0; i < prescribed.length; i++) {
    const idx = remaining.indexOf(prescribed[i]);
    if (idx !== -1) {
      completed.add(i);
      remaining.splice(idx, 1);
    }
  }

  return completed;
}
