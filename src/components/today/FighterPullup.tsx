'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface PullupDayInfo {
  program: string;
  day: number;
  sets: number[];
  rest: boolean;
}

interface Props {
  pullupDay: PullupDayInfo;
  todayStr: string;
  todaySets: number[];
  todayTotal: number;
}

export function FighterPullup({ pullupDay, todayStr, todaySets, todayTotal }: Props) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);
  const alreadyLogged = todaySets.length > 0;

  async function handleLogAll() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const setsStr = pullupDay.sets.join(',');
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
      {alreadyLogged && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-sm">Fighter Pullups</h3>
        <span className="text-xs text-slate-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          {pullupDay.program} Day {pullupDay.day}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {pullupDay.sets.map((reps, i) => (
          <div
            key={i}
            className="flex-1 text-center bg-indigo-50 border border-indigo-200 rounded-lg py-3"
          >
            <div className="text-2xl font-bold text-indigo-600">{reps}</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">Set {i + 1}</div>
          </div>
        ))}
      </div>

      {alreadyLogged ? (
        <p className="text-xs text-emerald-600 font-medium text-center">
          Logged: {todayTotal} total reps ({todaySets.length} sets)
        </p>
      ) : (
        <button
          onClick={handleLogAll}
          disabled={isLogging}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLogging ? 'Logging...' : 'Log All Sets'}
        </button>
      )}
    </div>
  );
}
