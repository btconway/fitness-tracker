'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getCompletedSetIndices } from '@/lib/utils';

interface SwingSet {
  reps: number;
  bell: string;
}

interface Props {
  todayStr: string;
  todaySets: number[];
  todayTotal: number;
  prescribedSets: SwingSet[];
  lastSetAt?: string | null;
}

const BELL_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  '24 kg': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', label: 'text-amber-500' },
  '28 kg': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', label: 'text-rose-500' },
  '32 kg': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'text-red-500' },
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function KBSwings({
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

  const prescribedReps = prescribedSets.map(s => s.reps);
  const completedIndices = getCompletedSetIndices(prescribedReps, todaySets);
  const allDone = prescribedSets.length > 0 && completedIndices.size === prescribedSets.length;
  const completedReps = todaySets.reduce((a, b) => a + b, 0);
  const remainingReps = prescribedSets.reduce(
    (sum, s, index) => sum + (completedIndices.has(index) ? 0 : s.reps),
    0
  );

  // Unique bells for header display
  const uniqueBells = [...new Set(prescribedSets.map(s => s.bell))];
  const bellSummary = uniqueBells.join(' / ');

  async function handleLogSet(reps: number, bell: string) {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'SWING',
          value: String(reps),
          swing_sets: String(reps),
          bell_size: bell,
          note: `KB Swings @ ${bell}`,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log swings');
    } catch {
      alert('Error logging swings');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleLogRemaining() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const remaining = prescribedSets.filter((_, i) => !completedIndices.has(i));
      for (const set of remaining) {
        const res = await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: todayStr,
            type: 'SWING',
            value: String(set.reps),
            swing_sets: String(set.reps),
            bell_size: set.bell,
            note: `KB Swings @ ${set.bell}`,
          }),
        });
        if (!res.ok) {
          alert('Failed to log swings');
          break;
        }
      }
      router.refresh();
    } catch {
      alert('Error logging swings');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-rose-400 p-4 relative">
      {allDone && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <div className={`flex items-center justify-between mb-3 ${allDone ? 'pr-9' : ''}`}>
        <h3 className="font-semibold text-slate-800 text-sm">KB Swings</h3>
        <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          {bellSummary}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {prescribedSets.map((set, i) => {
          const done = completedIndices.has(i);
          const colors = BELL_COLORS[set.bell] ?? BELL_COLORS['28 kg'];
          return (
            <button
              key={i}
              onClick={() => !done && handleLogSet(set.reps, set.bell)}
              disabled={isLogging || done}
              className={`flex-1 rounded-lg py-3 transition-colors ${
                done
                  ? 'bg-emerald-50 border border-emerald-300'
                  : `${colors.bg} border ${colors.border} active:opacity-80`
              } disabled:opacity-70`}
            >
              <div className={`text-2xl font-bold ${done ? 'text-emerald-600' : colors.text}`}>
                {set.reps}
              </div>
              <div className={`text-[10px] mt-0.5 font-medium ${done ? 'text-emerald-500' : colors.label}`}>
                {done ? 'Done' : set.bell}
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
        <p className="text-xs text-rose-600 font-medium text-center mb-2">
          {completedIndices.size}/{prescribedSets.length} sets done ({completedReps} reps) &middot; {remainingReps} remaining
        </p>
      )}

      {allDone ? (
        <p className="text-xs text-emerald-600 font-medium text-center">
          All sets complete! {todayTotal} total reps
        </p>
      ) : (
        <button
          onClick={handleLogRemaining}
          disabled={isLogging}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLogging ? 'Logging...' : completedIndices.size > 0 ? 'Log Remaining Sets' : 'Log All Sets'}
        </button>
      )}
    </div>
  );
}
