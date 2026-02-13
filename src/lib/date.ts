const CST_TIMEZONE = 'America/Chicago';

/** Get today's date in CST as YYYY-MM-DD */
export function getTodayCST(): string {
  const now = new Date();
  const cstDateStr = now.toLocaleDateString('en-US', {
    timeZone: CST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = cstDateStr.split('/');
  return `${year}-${month}-${day}`;
}

/** Get a Date object representing midnight CST today */
export function getNowCST(): Date {
  const today = getTodayCST();
  return new Date(`${today}T00:00:00-06:00`);
}

/** Program start date: Feb 10, 2026 (used for Fighter Pullup/Pushup programs) */
export const PROGRAM_START = new Date('2026-02-10T00:00:00-06:00');

/** ABC cycle start: Feb 9, 2026 (Monday) — aligns weeks to Mon-Sun */
export const ABC_PROGRAM_START = new Date('2026-02-09T00:00:00-06:00');

/** Calculate the 1-indexed cycle day (1-28) for a given CST date */
export function getCycleDay(date?: Date): number {
  const target = date ?? getNowCST();
  const diffTime = Math.abs(target.getTime() - ABC_PROGRAM_START.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return (diffDays % 28) + 1;
}

/** Calculate the week number (1-4) within the 28-day cycle */
export function getCycleWeek(cycleDay?: number): number {
  const d = cycleDay ?? getCycleDay();
  return Math.ceil(d / 7);
}

/** Calculate the linear day number since program start (1-indexed) */
export function getLinearDay(date?: Date): number {
  const target = date ?? getNowCST();
  const diffTime = Math.abs(target.getTime() - PROGRAM_START.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Get YYYY-MM for a date string */
export function getYearMonth(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/** Serialize a DB row's dates to strings (prevent React hydration errors) */
export function serializeDate(val: unknown): string {
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val);
}

export function serializeTimestamp(val: unknown): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}
