'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { getCycleDay, getCycleWeek, PROGRAM_START, getWeekStart, getWeekDates, formatDate } from '@/lib/date';
import { getFullPlanForDay, getFighterPullupDay, getFighterPushupDay, isSupplementaryDay, computeAutoDeferDates } from '@/lib/program';
import { getSwingPrescription } from '@/lib/goals';
import type { FitnessLog } from '@/lib/types';
import type { DayPlan } from '@/lib/program';
import { DayDetail } from './DayDetail';
import type { DayInfo, DayStatus, Status } from './types';

// ---- Constants ----

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PROGRAM_START_STR = '2026-02-12';

const TYPE_STYLES: Record<string, { border: string; bg: string; text: string; label: string }> = {
  AB_COMPLEX: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', label: 'AB' },
  WALK_MOVEMENT: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Walk' },
  HYPERTROPHY_PRESS: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', label: 'Press' },
  RUCK: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Ruck' },
  RECOVERY: { border: 'border-l-slate-400', bg: 'bg-slate-50', text: 'text-slate-500', label: 'Rest' },
};

const STATUS_ITEMS: { key: keyof DayStatus; label: string; supplementaryOnly?: boolean }[] = [
  { key: 'workout', label: 'WO' },
  { key: 'steps', label: 'Steps' },
  { key: 'pullups', label: 'PU' },
  { key: 'pushups', label: 'Push' },
  { key: 'swings', label: 'SW', supplementaryOnly: true },
  { key: 'weight', label: 'Wt' },
];

// ---- Helpers ----

function dateToCST(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00-06:00`);
}

function getProgramInfo(dateStr: string, pullupDeferDates: string[], pushupDeferDates: string[]) {
  const date = dateToCST(dateStr);
  const cycleDay = getCycleDay(date);
  const cycleWeek = getCycleWeek(cycleDay);
  const plan = getFullPlanForDay(cycleDay);
  const pullupDay = getFighterPullupDay(PROGRAM_START, date, { deferDates: pullupDeferDates });
  const pushupDay = getFighterPushupDay(PROGRAM_START, date, { deferDates: pushupDeferDates });
  return { cycleDay, cycleWeek, plan, pullupDay, pushupDay };
}

function computeSetStatus(prescribed: number[], logged: number[], rest: boolean): Status {
  if (rest || prescribed.length === 0) return 'done';
  if (logged.length === 0) return 'none';
  const remaining = [...prescribed];
  for (const s of logged) {
    const idx = remaining.indexOf(s);
    if (idx !== -1) remaining.splice(idx, 1);
  }
  return remaining.length === 0 ? 'done' : 'partial';
}

function computeDayStatus(
  dayLogs: FitnessLog[],
  plan: DayPlan,
  pullupDay: { sets: number[]; rest: boolean },
  pushupDay: { sets: number[]; rest: boolean },
  cycleDay: number,
  dateStr: string,
): DayStatus {
  const isRecovery = plan.type === 'RECOVERY';
  const hasWorkoutLog = dayLogs.some(l => l.type === 'WORKOUT' || l.type === 'CARRIES');
  const workout: Status = isRecovery ? 'done' : hasWorkoutLog ? 'done' : 'none';
  const steps: Status = dayLogs.some(l => l.type === 'STEPS') ? 'done' : 'none';
  const weight: Status = dayLogs.some(l => l.type === 'WEIGHT') ? 'done' : 'none';

  const pullupSets = dayLogs
    .filter(l => l.type === 'PULLUP')
    .flatMap(l => l.pullup_sets ? l.pullup_sets.split(',').map(s => parseInt(s.trim())) : []);
  const pullups = computeSetStatus(pullupDay.sets, pullupSets, pullupDay.rest);

  const pushupSets = dayLogs
    .filter(l => l.type === 'PUSHUP')
    .flatMap(l => l.pushup_sets ? l.pushup_sets.split(',').map(s => parseInt(s.trim())) : []);
  const pushups = computeSetStatus(pushupDay.sets, pushupSets, pushupDay.rest);

  let swings: Status = 'done';
  if (isSupplementaryDay(cycleDay)) {
    const swingRx = getSwingPrescription(dateStr);
    const prescribedReps = swingRx?.sets.map(s => s.reps) ?? [25, 25, 25];
    const swingSets = dayLogs
      .filter(l => l.type === 'SWING')
      .flatMap(l => l.swing_sets ? l.swing_sets.split(',').map(s => parseInt(s.trim())) : []);
    swings = computeSetStatus(prescribedReps, swingSets, false);
  }

  return { workout, steps, pullups, pushups, weight, swings };
}

function buildDayInfo(
  dateStr: string,
  logs: FitnessLog[],
  todayStr: string,
  pullupDeferDates: string[],
  pushupDeferDates: string[]
): DayInfo {
  const { cycleDay, cycleWeek, plan, pullupDay, pushupDay } = getProgramInfo(
    dateStr,
    pullupDeferDates,
    pushupDeferDates
  );
  const dayLogs = logs.filter(l => l.date === dateStr);
  const isFuture = dateStr > todayStr;
  const isToday = dateStr === todayStr;
  const isProgramActive = dateStr >= PROGRAM_START_STR;
  const status: DayStatus = isFuture
    ? { workout: 'none', steps: 'none', pullups: 'none', pushups: 'none', weight: 'none', swings: 'none' }
    : computeDayStatus(dayLogs, plan, pullupDay, pushupDay, cycleDay, dateStr);

  return { date: dateStr, cycleDay, cycleWeek, plan, pullupDay, pushupDay, logs: dayLogs, status, isFuture, isToday, isProgramActive };
}

function getOverallStatus(status: DayStatus): Status {
  const all = Object.values(status);
  if (all.every(s => s === 'done')) return 'done';
  if (all.some(s => s === 'done' || s === 'partial')) return 'partial';
  return 'none';
}

function getWeekLabel(weekStart: string): string {
  const dates = getWeekDates(weekStart);
  const start = dateToCST(dates[0]);
  const end = dateToCST(dates[6]);
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}\u2013${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} \u2013 ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
}

// ---- Main Component ----

interface Props {
  initialMonth: string;
  initialLogs: FitnessLog[];
  todayStr: string;
}

export function CalendarView({ initialMonth, initialLogs, todayStr }: Props) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayStr));
  const [month, setMonth] = useState(initialMonth);
  const [logs, setLogs] = useState<FitnessLog[]>(initialLogs);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/log');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch when week changes
  useEffect(() => {
    if (viewMode !== 'week') return;
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, viewMode]);

  // Refetch when month changes
  useEffect(() => {
    if (viewMode !== 'month') return;
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, viewMode]);

  function navigateWeek(delta: number) {
    const d = dateToCST(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(formatDate(d));
  }

  function navigateMonth(delta: number) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  function goToToday() {
    if (viewMode === 'week') {
      setWeekStart(getWeekStart(todayStr));
    } else {
      setMonth(todayStr.substring(0, 7));
    }
  }

  function handleViewToggle(mode: 'week' | 'month') {
    if (mode === viewMode) return;
    if (mode === 'month') {
      setMonth(weekStart.substring(0, 7));
    } else {
      const newWeek = month === todayStr.substring(0, 7)
        ? getWeekStart(todayStr)
        : getWeekStart(`${month}-01`);
      setWeekStart(newWeek);
    }
    setViewMode(mode);
  }

  function handleDeleteLog(id: number) {
    setLogs(prev => prev.filter(l => l.id !== id));
  }

  const pullupDeferDates = useMemo(() => {
    const loggedDates = new Set(logs.filter(l => l.type === 'PULLUP').map(l => l.date));
    const explicitDefers = Array.from(new Set(
      logs.filter(l => l.type === 'PULLUP' && l.value === 'DEFERRED').map(l => l.date)
    ));
    return computeAutoDeferDates(PROGRAM_START, todayStr, loggedDates, explicitDefers, 'PULLUP');
  }, [logs, todayStr]);

  const pushupDeferDates = useMemo(() => {
    const loggedDates = new Set(logs.filter(l => l.type === 'PUSHUP').map(l => l.date));
    const explicitDefers = Array.from(new Set(
      logs.filter(l => l.type === 'PUSHUP' && l.value === 'DEFERRED').map(l => l.date)
    ));
    return computeAutoDeferDates(PROGRAM_START, todayStr, loggedDates, explicitDefers, 'PUSHUP');
  }, [logs, todayStr]);

  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return [];
    return getWeekDates(weekStart).map(d => buildDayInfo(
      d,
      logs,
      todayStr,
      pullupDeferDates,
      pushupDeferDates
    ));
  }, [weekStart, logs, todayStr, viewMode, pullupDeferDates, pushupDeferDates]);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDay) return null;
    return buildDayInfo(
      selectedDay,
      logs,
      todayStr,
      pullupDeferDates,
      pushupDeferDates
    );
  }, [selectedDay, logs, todayStr, pullupDeferDates, pushupDeferDates]);

  const isCurrentWeek = weekStart === getWeekStart(todayStr);
  const isCurrentMonth = month === todayStr.substring(0, 7);
  const showTodayButton = viewMode === 'week' ? !isCurrentWeek : !isCurrentMonth;

  return (
    <>
      {/* View toggle + Today button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex bg-zinc-100 rounded-lg p-0.5 flex-1">
          <button
            onClick={() => handleViewToggle('week')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewToggle('month')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Month
          </button>
        </div>
        {showTodayButton && (
          <button
            onClick={goToToday}
            className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
          >
            Today
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
          className="p-2 hover:bg-zinc-100 rounded-lg"
          aria-label="Previous"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800">
          {viewMode === 'week'
            ? getWeekLabel(weekStart)
            : dateToCST(`${month}-15`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          }
        </h2>
        <button
          onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
          className="p-2 hover:bg-zinc-100 rounded-lg"
          aria-label="Next"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Tap or click a day to view completed entries or upcoming workouts.
      </p>

      {/* Content */}
      <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        {viewMode === 'week' ? (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {weekDays.map(day => (
              <DayCard key={day.date} day={day} onClick={() => setSelectedDay(day.date)} />
            ))}
          </div>
        ) : (
          <MonthGrid
            month={month}
            logs={logs}
            todayStr={todayStr}
            pullupDeferDates={pullupDeferDates}
            pushupDeferDates={pushupDeferDates}
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
          />
        )}
      </div>

      {/* Day Detail Sheet */}
      <DayDetail
        dayInfo={selectedDayInfo}
        onClose={() => setSelectedDay(null)}
        onDeleteLog={handleDeleteLog}
      />
    </>
  );
}

// ---- Day Card (Week View) ----

function DayCard({ day, onClick }: { day: DayInfo; onClick: () => void }) {
  const typeStyle = TYPE_STYLES[day.plan.type] || TYPE_STYLES.RECOVERY;
  const d = dateToCST(day.date);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  const monthAbbr = d.toLocaleDateString('en-US', { month: 'short' });

  return (
    <button
      onClick={onClick}
      className={`h-full w-full text-left bg-white rounded-xl border border-zinc-200 border-l-4 ${typeStyle.border} p-3 transition-colors hover:bg-zinc-50 ${
        day.isFuture ? 'opacity-60' : ''
      } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800">
            {dayName}, {monthAbbr} {dayNum}
          </span>
          {day.isToday && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              Today
            </span>
          )}
        </div>
        {day.isProgramActive && (
          <span className="text-[10px] text-slate-400">
            Day {day.cycleDay}/28 &middot; W{day.cycleWeek}
          </span>
        )}
      </div>

      {day.isProgramActive ? (
        <p className="text-sm font-medium text-slate-700 mb-2">{day.plan.title}</p>
      ) : (
        <p className="text-sm text-slate-400 italic mb-2">Program not started</p>
      )}

      {!day.isFuture && day.isProgramActive ? (
        <div className="flex gap-3">
          {STATUS_ITEMS
            .filter(item => !item.supplementaryOnly || isSupplementaryDay(day.cycleDay))
            .map(({ key, label }) => {
              const s = day.status[key];
              const color = s === 'done' ? 'bg-emerald-500' : s === 'partial' ? 'bg-amber-400' : 'bg-red-300';
              return (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-slate-400">{label}</span>
                </div>
              );
            })}
        </div>
      ) : day.isFuture && day.isProgramActive ? (
        <span className="text-[10px] text-slate-400 italic">Upcoming</span>
      ) : null}
    </button>
  );
}

// ---- Month Grid ----

function MonthGrid({
  month,
  logs,
  todayStr,
  pullupDeferDates,
  pushupDeferDates,
  selectedDay,
  onDayClick,
}: {
  month: string;
  logs: FitnessLog[];
  todayStr: string;
  pullupDeferDates: string[];
  pushupDeferDates: string[];
  selectedDay: string | null;
  onDayClick: (dateStr: string) => void;
}) {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDay = new Date(year, mon, 0);
  const daysInMonth = lastDay.getDate();

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  return (
    <>
      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 md:gap-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-1 text-center text-[10px] font-medium text-slate-400 md:text-xs">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[52px] md:min-h-[72px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
          const dayInfo = buildDayInfo(
            dateStr,
            logs,
            todayStr,
            pullupDeferDates,
            pushupDeferDates
          );
          const typeStyle = TYPE_STYLES[dayInfo.plan.type] || TYPE_STYLES.RECOVERY;
          const overall = dayInfo.isFuture ? null : getOverallStatus(dayInfo.status);
          const isSelected = selectedDay === dateStr;

          return (
            <button
              key={dayNum}
              onClick={() => onDayClick(dateStr)}
              className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg p-1 transition-colors md:min-h-[72px] md:p-2 lg:min-h-[84px] ${
                dayInfo.isToday ? 'ring-2 ring-blue-500' : ''
              } ${isSelected ? 'bg-zinc-200' : dayInfo.isProgramActive ? typeStyle.bg : ''} hover:brightness-95`}
            >
              <span className={`text-xs font-medium md:text-sm ${dayInfo.isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                {dayNum}
              </span>
              {dayInfo.isProgramActive && !dayInfo.isFuture && overall !== null ? (
                overall === 'done'
                  ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                  : overall === 'partial'
                    ? <Circle size={14} className="text-amber-400 fill-amber-400 mt-0.5" />
                    : <Circle size={14} className="text-red-300 mt-0.5" />
              ) : dayInfo.isProgramActive ? (
                <span className={`text-[9px] font-medium mt-0.5 ${typeStyle.text}`}>
                  {typeStyle.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
