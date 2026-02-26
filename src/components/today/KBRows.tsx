'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getCompletedSetIndices } from '@/lib/utils';

interface Props {
  todayStr: string;
  todaySets: number[];
  todayTotal: number;
  prescribedSets: number[];
  lastSetAt?: string | null;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function KBRows({
  todayStr,
  todaySets,
  todayTotal,
  prescribedSets,
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

  const completedIndices = getCompletedSetIndices(prescribedSets, todaySets);
  const allDone = prescribedSets.length > 0 && completedIndices.size === prescribedSets.length;
  const completedReps = todaySets.reduce((a, b) => a + b, 0);
  const remainingReps = prescribedSets.reduce(
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
          type: 'ROW',
          value: String(reps),
          row_sets: String(reps),
          bell_size: '24 kg',
          note: 'KB Rows 3x10/arm',
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log rows');
    } catch {
      alert('Error logging rows');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleLogRemaining() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const remainingSets = prescribedSets.filter((_, i) => !completedIndices.has(i));
      const setsStr = remainingSets.join(',');
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'ROW',
          value: setsStr,
          row_sets: setsStr,
          bell_size: '24 kg',
          note: 'KB Rows 3x10/arm',
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log rows');
    } catch {
      alert('Error logging rows');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-cyan-400 p-4 relative">
      {allDone && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <div className={`flex items-center justify-between mb-3 ${allDone ? 'pr-9' : ''}`}>
        <h3 className="font-semibold text-slate-800 text-sm">KB Rows</h3>
        <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          24 kg
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {prescribedSets.map((reps, i) => {
          const done = completedIndices.has(i);
          return (
            <button
              key={i}
              onClick={() => !done && handleLogSet(reps)}
              disabled={isLogging || done}
              className={`flex-1 rounded-lg py-3 transition-colors ${
                done
                  ? 'bg-emerald-50 border border-emerald-300'
                  : 'bg-cyan-50 border border-cyan-200 active:bg-cyan-100'
              } disabled:opacity-70`}
            >
              <div className={`text-2xl font-bold ${done ? 'text-emerald-600' : 'text-cyan-600'}`}>
                {reps}
              </div>
              <div className={`text-[10px] mt-0.5 ${done ? 'text-emerald-500 font-medium' : 'text-cyan-400'}`}>
                {done ? 'Done' : `Set ${i + 1}`}
              </div>
              <div className={`text-[9px] ${done ? 'text-emerald-400' : 'text-cyan-300'}`}>
                /arm
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

      {!allDone && (
        <p className="text-xs text-cyan-600 font-medium text-center mb-2">
          {completedIndices.size}/{prescribedSets.length} sets done ({completedReps} reps/arm) &middot; {remainingReps}/arm remaining
        </p>
      )}

      {allDone ? (
        <p className="text-xs text-emerald-600 font-medium text-center">
          All sets complete! {todayTotal} reps/arm
        </p>
      ) : (
        <button
          onClick={handleLogRemaining}
          disabled={isLogging}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLogging ? 'Logging...' : completedIndices.size > 0 ? 'Log Remaining Sets' : 'Log All Sets'}
        </button>
      )}
    </div>
  );
}
