'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayDetail } from './DayDetail';
import type { FitnessLog } from '@/lib/types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_COLORS: Record<string, string> = {
  WORKOUT: 'bg-blue-500',
  STEPS: 'bg-amber-500',
  PULLUP: 'bg-indigo-500',
  PUSHUP: 'bg-emerald-500',
  WEIGHT: 'bg-purple-500',
};

interface Props {
  initialMonth: string;
  initialLogs: FitnessLog[];
  todayStr: string;
}

export function CalendarGrid({ initialMonth, initialLogs, todayStr }: Props) {
  const [month, setMonth] = useState(initialMonth);
  const [logs, setLogs] = useState<FitnessLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchMonth = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/log?month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch {
      // keep current logs on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (month !== initialMonth) {
      fetchMonth(month);
    }
  }, [month, initialMonth, fetchMonth]);

  function navigate(delta: number) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setMonth(newMonth);
  }

  // Build calendar grid
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDay = new Date(year, mon, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  // Group logs by date
  const logsByDate = new Map<string, FitnessLog[]>();
  for (const log of logs) {
    const existing = logsByDate.get(log.date) || [];
    existing.push(log);
    logsByDate.set(log.date, existing);
  }

  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const selectedDayLogs = selectedDay ? logsByDate.get(selectedDay) || [] : [];

  return (
    <>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-lg" aria-label="Previous month">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800">{monthLabel}</h2>
        <button onClick={() => navigate(1)} className="p-2 hover:bg-zinc-100 rounded-lg" aria-label="Next month">
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className={`grid grid-cols-7 gap-1 ${loading ? 'opacity-50' : ''}`}>
        {/* Empty cells before first day */}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[44px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
          const dayLogs = logsByDate.get(dateStr) || [];
          const types = new Set(dayLogs.map(l => l.type));
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(dateStr)}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg p-1 transition-colors ${
                isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-zinc-100'
              } ${selectedDay === dateStr ? 'bg-zinc-200' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                {dayNum}
              </span>
              {types.size > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from(types).slice(0, 4).map(t => (
                    <div key={t} className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[t] || 'bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail sheet */}
      <DayDetail
        dateStr={selectedDay}
        logs={selectedDayLogs}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
