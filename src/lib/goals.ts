import type { FitnessLog } from '@/lib/types';

// ---- Goal constants ----

export const GOAL_DEADLINE = '2026-04-27';
export const GOAL_START_DATE = '2026-02-27';

export const BELL_GOAL = {
  targetRounds: 10,
  targetBell: '28 kg',
  baseBell: '24 kg',
} as const;

export const WEIGHT_GOAL = {
  startWeight: 207,
  targetWeight: 192,
} as const;

export const CHINUP_GOAL = {
  startMax: 6,
  targetMax: 10,
} as const;

// ---- Bell Prescription ----

export interface BellPrescription {
  heavyRounds: number;
  lightRounds: number;
  totalRounds: number;
  heavyBell: string;
  lightBell: string;
  weekNumber: number;
}

// Volume-day schedule: week number → 28 kg rounds
const BELL_SCHEDULE: Record<number, number> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 9,
};
const BELL_SCHEDULE_FINAL = 10;

/**
 * Get the bell prescription for a Monday quality day (5 rounds all at 28 kg).
 */
export function getQualityDayPrescription(dateStr: string): BellPrescription | null {
  const goalStart = new Date(`${GOAL_START_DATE}T00:00:00-06:00`);
  const target = new Date(`${dateStr}T00:00:00-06:00`);

  const diffMs = target.getTime() - goalStart.getTime();
  if (diffMs < 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;

  return {
    heavyRounds: 5,
    lightRounds: 0,
    totalRounds: 5,
    heavyBell: BELL_GOAL.targetBell,
    lightBell: BELL_GOAL.baseBell,
    weekNumber,
  };
}

/**
 * Get the bell prescription for a given date.
 * Returns a prescription on volume days (Wed/Fri AB Complex in weeks 1-3 of cycle),
 * or null for non-volume days.
 */
export function getBellPrescription(dateStr: string): BellPrescription | null {
  const goalStart = new Date(`${GOAL_START_DATE}T00:00:00-06:00`);
  const target = new Date(`${dateStr}T00:00:00-06:00`);

  const diffMs = target.getTime() - goalStart.getTime();
  if (diffMs < 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;

  const heavyRounds = weekNumber >= 8
    ? BELL_SCHEDULE_FINAL
    : (BELL_SCHEDULE[weekNumber] ?? BELL_SCHEDULE_FINAL);

  const totalRounds = 10;
  const lightRounds = totalRounds - heavyRounds;

  return {
    heavyRounds,
    lightRounds,
    totalRounds,
    heavyBell: BELL_GOAL.targetBell,
    lightBell: BELL_GOAL.baseBell,
    weekNumber,
  };
}

// ---- Goal Status ----

export interface GoalStatus {
  label: string;
  current: number;
  target: number;
  unit: string;
  pctComplete: number;
  status: 'ahead' | 'on_track' | 'behind' | 'way_behind' | 'tracking';
  statusLabel: string;
  subtitle: string;
}

export interface GoalSummary {
  goals: GoalStatus[];
  daysRemaining: number;
  weekNumber: number;
}

/** Days from a date string to the goal deadline */
export function daysUntil(fromStr: string): number {
  const from = new Date(`${fromStr}T00:00:00-06:00`);
  const deadline = new Date(`${GOAL_DEADLINE}T00:00:00-06:00`);
  return Math.max(0, Math.round((deadline.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Week number in the 8-week goal period (1-indexed) */
function goalWeekNumber(todayStr: string): number {
  const start = new Date(`${GOAL_START_DATE}T00:00:00-06:00`);
  const today = new Date(`${todayStr}T00:00:00-06:00`);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getStatusFromComparison(
  current: number,
  expected: number,
  higher_is_better: boolean,
): 'ahead' | 'on_track' | 'behind' | 'way_behind' {
  const diff = higher_is_better ? current - expected : expected - current;
  if (diff >= 1) return 'ahead';
  if (diff >= 0) return 'on_track';
  if (diff >= -2) return 'behind';
  return 'way_behind';
}

function statusLabel(status: GoalStatus['status']): string {
  switch (status) {
    case 'ahead': return 'Ahead';
    case 'on_track': return 'On Track';
    case 'behind': return 'Behind';
    case 'way_behind': return 'Behind';
    case 'tracking': return 'Tracking...';
  }
}

function computeBellGoal(logs: FitnessLog[], weekNum: number): GoalStatus {
  // Find best 28 kg round count from recent volume-day workouts
  const workoutLogs = logs.filter(l => l.type === 'WORKOUT' && l.value === 'COMPLETED');

  let best28kgRounds = 0;
  for (const log of workoutLogs.slice(0, 20)) {
    // Check primary bell
    if (log.bell_size === '28 kg' && log.rounds) {
      best28kgRounds = Math.max(best28kgRounds, log.rounds);
    }
    // Check secondary bell
    if (log.secondary_bell_size === '28 kg' && log.secondary_rounds) {
      best28kgRounds = Math.max(best28kgRounds, log.secondary_rounds);
    }
  }

  const expectedForWeek = weekNum >= 8
    ? BELL_SCHEDULE_FINAL
    : (BELL_SCHEDULE[weekNum] ?? BELL_SCHEDULE_FINAL);

  const status = getStatusFromComparison(best28kgRounds, expectedForWeek, true);
  const pct = Math.min(100, Math.max(0, (best28kgRounds / BELL_GOAL.targetRounds) * 100));

  return {
    label: '10 Rounds @ 28 kg',
    current: best28kgRounds,
    target: BELL_GOAL.targetRounds,
    unit: 'rounds',
    pctComplete: pct,
    status,
    statusLabel: statusLabel(status),
    subtitle: `Week ${weekNum}: ${expectedForWeek} heavy rounds expected`,
  };
}

function computeWeightGoal(logs: FitnessLog[], todayStr: string): GoalStatus {
  const weightLogs = logs
    .filter(l => l.type === 'WEIGHT')
    .map(l => ({ date: l.date, weight: parseFloat(l.value) }))
    .filter(l => !isNaN(l.weight))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (weightLogs.length === 0) {
    return {
      label: 'Lose 15 lbs',
      current: WEIGHT_GOAL.startWeight,
      target: WEIGHT_GOAL.targetWeight,
      unit: 'lbs',
      pctComplete: 0,
      status: 'tracking',
      statusLabel: 'Tracking...',
      subtitle: 'Log your weight to start tracking',
    };
  }

  // Group by ISO week and compute weekly averages
  const weekMap = new Map<string, number[]>();
  for (const l of weightLogs) {
    const d = new Date(`${l.date}T12:00:00-06:00`);
    const weekStart = getISOWeekStart(d);
    const arr = weekMap.get(weekStart) ?? [];
    arr.push(l.weight);
    weekMap.set(weekStart, arr);
  }

  const weeklyAvgs = Array.from(weekMap.entries())
    .map(([week, weights]) => ({
      week,
      avg: weights.reduce((a, b) => a + b, 0) / weights.length,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const current = weeklyAvgs.length > 0
    ? weeklyAvgs[weeklyAvgs.length - 1].avg
    : weightLogs[weightLogs.length - 1].weight;

  const lostSoFar = WEIGHT_GOAL.startWeight - current;
  const pct = Math.min(100, Math.max(0, (lostSoFar / (WEIGHT_GOAL.startWeight - WEIGHT_GOAL.targetWeight)) * 100));

  if (weeklyAvgs.length < 2) {
    return {
      label: 'Lose 15 lbs',
      current: Math.round(current * 10) / 10,
      target: WEIGHT_GOAL.targetWeight,
      unit: 'lbs',
      pctComplete: pct,
      status: 'tracking',
      statusLabel: 'Tracking...',
      subtitle: 'Need more data for projection',
    };
  }

  // Compute weekly loss rate via simple linear regression
  const remaining = current - WEIGHT_GOAL.targetWeight;
  const daysLeft = daysUntil(todayStr);
  const weeksLeft = daysLeft / 7;
  const neededPerWeek = weeksLeft > 0 ? remaining / weeksLeft : remaining;

  // Use last few weeks to estimate actual rate
  const recentWeeks = weeklyAvgs.slice(-4);
  const firstAvg = recentWeeks[0].avg;
  const lastAvg = recentWeeks[recentWeeks.length - 1].avg;
  const weekSpan = recentWeeks.length - 1;
  const actualRatePerWeek = weekSpan > 0 ? (firstAvg - lastAvg) / weekSpan : 0;

  let status: GoalStatus['status'];
  if (actualRatePerWeek >= neededPerWeek) {
    status = actualRatePerWeek >= neededPerWeek * 1.2 ? 'ahead' : 'on_track';
  } else {
    status = actualRatePerWeek >= neededPerWeek * 0.5 ? 'behind' : 'way_behind';
  }

  return {
    label: 'Lose 15 lbs',
    current: Math.round(current * 10) / 10,
    target: WEIGHT_GOAL.targetWeight,
    unit: 'lbs',
    pctComplete: pct,
    status,
    statusLabel: statusLabel(status),
    subtitle: `Need ~${neededPerWeek.toFixed(1)} lbs/week`,
  };
}

function computeChinupGoal(logs: FitnessLog[], weekNum: number): GoalStatus {
  // Extract max single set from recent pullup logs
  const pullupLogs = logs
    .filter(l => l.type === 'PULLUP' && l.pullup_sets)
    .slice(0, 30); // Recent logs

  let bestSet = 0;
  for (const log of pullupLogs) {
    if (!log.pullup_sets) continue;
    const sets = log.pullup_sets.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const max = Math.max(0, ...sets);
    bestSet = Math.max(bestSet, max);
  }

  // Expected: linear interpolation from startMax to targetMax over 8 weeks
  const { startMax, targetMax } = CHINUP_GOAL;
  const expectedForWeek = startMax + ((targetMax - startMax) * Math.min(weekNum, 8)) / 8;

  const status = bestSet === 0
    ? 'tracking' as const
    : getStatusFromComparison(bestSet, expectedForWeek, true);

  const pct = Math.min(100, Math.max(0, ((bestSet - startMax) / (targetMax - startMax)) * 100));

  return {
    label: '10 Chin-ups',
    current: bestSet || startMax,
    target: targetMax,
    unit: 'reps',
    pctComplete: Math.max(0, pct),
    status,
    statusLabel: statusLabel(status),
    subtitle: bestSet > 0 ? `Best recent set: ${bestSet} reps` : 'Log pull-ups to start tracking',
  };
}

/** Compute goal status for all three goals */
export function computeGoalStatus(logs: FitnessLog[], todayStr: string): GoalSummary {
  const weekNum = goalWeekNumber(todayStr);
  const remaining = daysUntil(todayStr);

  return {
    goals: [
      computeBellGoal(logs, weekNum),
      computeWeightGoal(logs, todayStr),
      computeChinupGoal(logs, weekNum),
    ],
    daysRemaining: remaining,
    weekNumber: weekNum,
  };
}

// ---- Helpers ----

function getISOWeekStart(d: Date): string {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  date.setDate(date.getDate() - diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
