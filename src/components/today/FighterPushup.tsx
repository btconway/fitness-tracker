'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getCompletedSetIndices } from '@/lib/utils';

interface PushupDayInfo {
  program: string;
  day: number;
  sets: number[];
  rest: boolean;
}

interface Props {
  pushupDay: PushupDayInfo;
  todayStr: string;
  todaySets: number[];
  todayTotal: number;
}

export function FighterPushup({ pushupDay, todayStr, todaySets, todayTotal }: Props) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);

  const completedIndices = getCompletedSetIndices(pushupDay.sets, todaySets);
  const allDone = pushupDay.sets.length > 0 && completedIndices.size === pushupDay.sets.length;
  const completedReps = todaySets.reduce((a, b) => a + b, 0);

  async function handleLogSet(reps: number) {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PUSHUP',
          value: String(reps),
          pushup_sets: String(reps),
          note: `Fighter Push-ups ${pushupDay.program} Day ${pushupDay.day}`,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log push-ups');
    } catch {
      alert('Error logging push-ups');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleLogRemaining() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const remainingSets = pushupDay.sets.filter((_, i) => !completedIndices.has(i));
      const setsStr = remainingSets.join(',');
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PUSHUP',
          value: setsStr,
          pushup_sets: setsStr,
          note: `Fighter Push-ups ${pushupDay.program} Day ${pushupDay.day}`,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log push-ups');
    } catch {
      alert('Error logging push-ups');
    } finally {
      setIsLogging(false);
    }
  }

  if (pushupDay.rest) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-emerald-400 p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-800 text-sm">Fighter Push-ups (GTG)</h3>
          <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {pushupDay.program} Day {pushupDay.day}
          </span>
        </div>
        <p className="text-slate-500 text-sm">Rest day — recover and rebuild.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-emerald-400 p-4 relative">
      {allDone && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <div className={`flex items-center justify-between mb-3 ${allDone ? 'pr-9' : ''}`}>
        <h3 className="font-semibold text-slate-800 text-sm">Fighter Push-ups (GTG)</h3>
        <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          {pushupDay.program} Day {pushupDay.day}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {pushupDay.sets.map((reps, i) => {
          const done = completedIndices.has(i);
          return (
            <button
              key={i}
              onClick={() => !done && handleLogSet(reps)}
              disabled={isLogging || done}
              className={`flex-1 rounded-lg py-3 transition-colors ${
                done
                  ? 'bg-emerald-50 border border-emerald-300'
                  : 'bg-emerald-50 border border-emerald-200 active:bg-emerald-100'
              } disabled:opacity-70`}
            >
              <div className={`text-2xl font-bold ${done ? 'text-emerald-600' : 'text-emerald-700'}`}>
                {reps}
              </div>
              <div className={`text-[10px] mt-0.5 ${done ? 'text-emerald-500 font-medium' : 'text-emerald-400'}`}>
                {done ? 'Done' : `Set ${i + 1}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress text */}
      {todaySets.length > 0 && !allDone && (
        <p className="text-xs text-emerald-600 font-medium text-center mb-2">
          {completedIndices.size}/{pushupDay.sets.length} sets done ({completedReps} reps)
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLogging ? 'Logging...' : completedIndices.size > 0 ? 'Log Remaining Sets' : 'Log All Sets'}
        </button>
      )}
    </div>
  );
}
