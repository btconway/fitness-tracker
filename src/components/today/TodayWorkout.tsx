'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { DayPlan } from '@/lib/program';

const TYPE_COLORS: Record<string, string> = {
  AB_COMPLEX: 'border-l-blue-500',
  WALK_MOVEMENT: 'border-l-amber-500',
  HYPERTROPHY_PRESS: 'border-l-purple-500',
  RUCK: 'border-l-green-500',
  RECOVERY: 'border-l-slate-400',
};

interface Props {
  plan: DayPlan;
  todayStr: string;
  alreadyLogged: boolean;
}

export function TodayWorkout({ plan, todayStr, alreadyLogged }: Props) {
  const router = useRouter();
  const [selectedRounds, setSelectedRounds] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const borderColor = TYPE_COLORS[plan.type] || 'border-l-slate-400';
  const hasRounds = plan.type === 'AB_COMPLEX' || plan.type === 'HYPERTROPHY_PRESS';
  const [minR, maxR] = plan.roundsRange || [3, 6];

  const roundOptions: number[] = [];
  if (hasRounds) {
    for (let r = minR; r <= Math.min(maxR, 10); r++) roundOptions.push(r);
    if (maxR > 10) roundOptions.push(maxR);
  }

  async function handleLog() {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'WORKOUT',
          value: 'COMPLETED',
          rounds: selectedRounds,
          note: null,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log workout');
    } catch {
      alert('Error logging workout');
    } finally {
      setIsLogging(false);
    }
  }

  const displayNotes = plan.detailedNotes || plan.notes;

  return (
    <div className={`bg-white rounded-xl border border-zinc-200 border-l-4 ${borderColor} p-4 relative`}>
      {alreadyLogged && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}
      <h3 className="font-semibold text-slate-800 text-sm mb-2">{plan.title}</h3>

      {/* Warmup */}
      {plan.warmup && plan.warmup.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Warm-up</p>
          <ul className="space-y-0.5">
            {plan.warmup.map((item, i) => (
              <li key={i} className="text-xs text-amber-800">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {plan.exercises.length > 0 && (
        <ul className="space-y-1 mb-3">
          {plan.exercises.map((ex, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-slate-700">{ex.name}</span>
              <span className="font-mono font-semibold text-slate-900">{ex.reps}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Round guidance */}
      {hasRounds && (
        <p className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 mb-3">
          Repeat {minR}-{maxR} rounds
        </p>
      )}

      {plan.carries && (
        <p className="text-xs text-slate-600 bg-zinc-50 rounded-lg px-3 py-2 mb-3">
          {plan.carries}
        </p>
      )}

      <p className="text-xs text-slate-500 mb-3">{displayNotes}</p>

      {/* Cooldown */}
      {plan.cooldown && plan.cooldown.length > 0 && !alreadyLogged && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Cool-down</p>
          <ul className="space-y-0.5">
            {plan.cooldown.map((item, i) => (
              <li key={i} className="text-xs text-blue-800">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {hasRounds && !alreadyLogged && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            {roundOptions.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRounds(r)}
                className={`min-w-[44px] h-11 rounded-lg font-semibold text-sm transition-colors ${
                  selectedRounds === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleLog}
            disabled={isLogging || !selectedRounds}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {isLogging ? 'Logging...' : 'Log Workout'}
          </button>
        </>
      )}

      {!hasRounds && !alreadyLogged && plan.type !== 'RECOVERY' && (
        <button
          onClick={handleLog}
          disabled={isLogging}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLogging ? 'Logging...' : 'Mark Complete'}
        </button>
      )}

      {/* Steps goal */}
      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Daily Steps Goal</span>
        <span className="text-xs font-semibold text-slate-600">{plan.stepsGoal.toLocaleString()}</span>
      </div>
    </div>
  );
}
