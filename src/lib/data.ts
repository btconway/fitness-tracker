import { sql, isDatabaseConfigured } from '@/lib/db';
import { serializeDate, serializeTimestamp, getTodayCST, getNowCST, getCycleDay, PROGRAM_START } from '@/lib/date';
import { getFullPlanForDay, getFighterPullupDay } from '@/lib/program';
import type { FitnessLog } from '@/lib/types';

/** Fetch all logs, serialized and sorted by date DESC */
export async function fetchAllLogs(): Promise<FitnessLog[]> {
  if (!isDatabaseConfigured() || !sql) return [];
  const rawLogs = await sql`SELECT * FROM fitness_logs ORDER BY date DESC, created_at DESC`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(rawLogs) ? rawLogs : [];
  return rows.map(serializeLog);
}

/** Fetch logs for a specific month (YYYY-MM) */
export async function fetchLogsByMonth(month: string): Promise<FitnessLog[]> {
  if (!isDatabaseConfigured() || !sql) return [];
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  const rawLogs = await sql`
    SELECT * FROM fitness_logs
    WHERE date >= ${startDate} AND date <= ${endDate}
    ORDER BY date DESC, created_at DESC
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(rawLogs) ? rawLogs : [];
  return rows.map(serializeLog);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeLog(log: any): FitnessLog {
  return {
    ...log,
    date: serializeDate(log.date),
    created_at: serializeTimestamp(log.created_at),
  } as FitnessLog;
}

/** Get today's context: plan, pullup day, today's logs */
export async function getTodayContext() {
  const logs = await fetchAllLogs();
  const todayStr = getTodayCST();
  const nowCST = getNowCST();

  const cycleDay = getCycleDay(nowCST);
  const plan = getFullPlanForDay(cycleDay);
  const pullupDay = getFighterPullupDay(PROGRAM_START, nowCST);

  const todayLogs = logs.filter(l => l.date === todayStr);
  const todayWorkout = todayLogs.find(l => l.type === 'WORKOUT');
  const todaySteps = todayLogs.find(l => l.type === 'STEPS');
  const todayWeight = todayLogs.find(l => l.type === 'WEIGHT');

  const todayPullups = todayLogs.filter(l => l.type === 'PULLUP');
  const todayPullupSets = todayPullups.flatMap(l =>
    l.pullup_sets ? l.pullup_sets.split(',').map(s => parseInt(s.trim())) : []
  );
  const todayPullupTotal = todayPullupSets.reduce((a, b) => a + b, 0);

  const todayPushups = todayLogs.filter(l => l.type === 'PUSHUP');
  const todayPushupSets = todayPushups.flatMap(l =>
    l.pushup_sets ? l.pushup_sets.split(',').map(s => parseInt(s.trim())) : []
  );
  const todayPushupTotal = todayPushupSets.reduce((a, b) => a + b, 0);

  // Last weight for placeholder
  const weightLogs = logs.filter(l => l.type === 'WEIGHT');
  const lastWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].value) : null;

  return {
    todayStr,
    cycleDay,
    plan,
    pullupDay,
    todayWorkout,
    todaySteps,
    todayWeight,
    todayPullupSets,
    todayPullupTotal,
    todayPushupSets,
    todayPushupTotal,
    lastWeight,
    logs,
  };
}

/** Compute progress/stats metrics from all logs */
export function computeMetrics(logs: FitnessLog[]) {
  const workoutLogs = logs.filter(l => l.type === 'WORKOUT' && l.value === 'COMPLETED');
  const roundsLogs = logs.filter(l => l.type === 'WORKOUT' && l.rounds);
  const weightLogs = logs.filter(l => l.type === 'WEIGHT');
  const pullupLogs = logs.filter(l => l.type === 'PULLUP');
  const pushupLogs = logs.filter(l => l.type === 'PUSHUP');

  const totalWorkouts = workoutLogs.length;

  const averageRounds = roundsLogs.length > 0
    ? (roundsLogs.reduce((acc, l) => acc + (l.rounds || 0), 0) / roundsLogs.length).toFixed(1)
    : '0';

  const prescribedWorkouts = roundsLogs.filter(l => (l.rounds || 0) >= 5).length;
  const prescribedPct = roundsLogs.length > 0
    ? Math.round((prescribedWorkouts / roundsLogs.length) * 100)
    : 0;

  const latestWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].value) : null;
  const startWeight = weightLogs.length > 0 ? parseFloat(weightLogs[weightLogs.length - 1].value) : null;
  const weightChange = latestWeight && startWeight ? latestWeight - startWeight : null;

  // Streak: count consecutive days with a WORKOUT log from today backwards
  const todayStr = getTodayCST();
  const workoutDates = new Set(workoutLogs.map(l => l.date));
  let streak = 0;
  const d = new Date(todayStr + 'T00:00:00-06:00');
  while (workoutDates.has(formatDateStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const recentRounds = roundsLogs.slice(0, 10).reverse();

  // Lifetime totals
  const lifetimePullups = pullupLogs.reduce((acc, l) => {
    const sets = l.pullup_sets ? l.pullup_sets.split(',').map(s => parseInt(s.trim())) : [];
    return acc + sets.reduce((a, b) => a + b, 0);
  }, 0);

  const lifetimePushups = pushupLogs.reduce((acc, l) => {
    const sets = l.pushup_sets ? l.pushup_sets.split(',').map(s => parseInt(s.trim())) : [];
    return acc + sets.reduce((a, b) => a + b, 0);
  }, 0);

  return {
    totalWorkouts,
    averageRounds,
    prescribedPct,
    latestWeight,
    startWeight,
    weightChange,
    weightLogs,
    streak,
    recentRounds,
    lifetimePullups,
    lifetimePushups,
  };
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
