'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getCompletedSetIndices } from '@/lib/utils';

interface PullupDayInfo {
  program: string;
  day: number;
  sets: number[];
  rest: boolean;
  deferredTo?: string;
}

interface Props {
  pullupDay: PullupDayInfo;
  todayStr: string;
  todaySets: number[];
  todayTotal: number;
  deferredToday?: boolean;
  lastSetAt?: string | null;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return 'next business day';
  const d = new Date(`${dateStr}T12:00:00-06:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function FighterPullup({
  pullupDay,
  todayStr,
  todaySets,
  todayTotal,
  deferredToday,
  lastSetAt,
}: Props) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!lastSetAt) return;
    const ref = new Date(lastSetAt).getTime();
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - ref) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSetAt]);

  const completedIndices = getCompletedSetIndices(pullupDay.sets, todaySets);
  const allDone = pullupDay.sets.length > 0 && completedIndices.size === pullupDay.sets.length;
  const completedReps = todaySets.reduce((a, b) => a + b, 0);
  const remainingReps = pullupDay.sets.reduce(
    (sum, reps, index) => sum + (completedIndices.has(index) ? 0 : reps),
    0
  );

  async function handleLogSet(reps: number) {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PULLUP',
          value: String(reps),
          pullup_sets: String(reps),
          note: `Fighter ${pullupDay.program} Day ${pullupDay.day}`,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log pullups');
    } catch {
      alert('Error logging pullups');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleLogRemaining() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const remainingSets = pullupDay.sets.filter((_, i) => !completedIndices.has(i));
      const setsStr = remainingSets.join(',');
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PULLUP',
          value: setsStr,
          pullup_sets: setsStr,
          note: `Fighter ${pullupDay.program} Day ${pullupDay.day}`,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log pullups');
    } catch {
      alert('Error logging pullups');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleDefer() {
    if (isLogging || pullupDay.rest || todaySets.length > 0 || deferredToday) return;
    if (!confirm('Defer today\'s pull-up session to the next business day?')) return;

    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PULLUP',
          value: 'DEFERRED',
          note: 'Deferred to next business day',
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to defer pull-ups');
    } catch {
      alert('Error deferring pull-ups');
    } finally {
      setIsLogging(false);
    }
  }

  if (pullupDay.program === 'DEFERRED') {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-indigo-400 p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Fighter Pullups</h3>
        <p className="text-slate-600 text-sm">
          Deferred today. Next session lands on {formatDateLabel(pullupDay.deferredTo)}.
        </p>
      </div>
    );
  }

  if (pullupDay.rest) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-indigo-400 p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-800 text-sm">Fighter Pullups</h3>
          <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {pullupDay.program} Day {pullupDay.day}
          </span>
        </div>
        <p className="text-slate-500 text-sm">Rest day — recover and rebuild.</p>
      </div>
    );
  }

  if (pullupDay.program === 'RETEST') {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-indigo-400 p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Fighter Pullups — Retest</h3>
        <p className="text-slate-600 text-sm">Programs complete. Take 2-3 days off, then test your max.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-indigo-400 p-4 relative">
      {allDone && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <div className={`flex items-center justify-between mb-3 ${allDone ? 'pr-9' : ''}`}>
        <h3 className="font-semibold text-slate-800 text-sm">Fighter Pullups</h3>
        <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          {pullupDay.program} Day {pullupDay.day}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {pullupDay.sets.map((reps, i) => {
          const done = completedIndices.has(i);
          return (
            <button
              key={i}
              onClick={() => !done && handleLogSet(reps)}
              disabled={isLogging || done}
              className={`flex-1 rounded-lg py-3 transition-colors ${
                done
                  ? 'bg-emerald-50 border border-emerald-300'
                  : 'bg-indigo-50 border border-indigo-200 active:bg-indigo-100'
              } disabled:opacity-70`}
            >
              <div className={`text-2xl font-bold ${done ? 'text-emerald-600' : 'text-indigo-600'}`}>
                {reps}
              </div>
              <div className={`text-[10px] mt-0.5 ${done ? 'text-emerald-500 font-medium' : 'text-indigo-400'}`}>
                {done ? 'Done' : `Set ${i + 1}`}
              </div>
            </button>
          );
        })}
      </div>

      {lastSetAt && (
        <p className="text-xs text-slate-400 text-center mb-2">
          {formatElapsed(elapsedSeconds)} since last set
        </p>
      )}

      {/* Progress text */}
      {!allDone && (
        <p className="text-xs text-indigo-600 font-medium text-center mb-2">
          {completedIndices.size}/{pullupDay.sets.length} sets done ({completedReps} reps) • {remainingReps} reps remaining
        </p>
      )}

      {allDone ? (
        <p className="text-xs text-emerald-600 font-medium text-center">
          All sets complete! {todayTotal} total reps
        </p>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleLogRemaining}
            disabled={isLogging}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {isLogging ? 'Logging...' : completedIndices.size > 0 ? 'Log Remaining Sets' : 'Log All Sets'}
          </button>
          {todaySets.length === 0 && !deferredToday && (
            <button
              onClick={handleDefer}
              disabled={isLogging}
              className="w-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
            >
              {isLogging ? 'Saving...' : 'Defer to Next Business Day'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
