'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { DayPlan } from '@/lib/program';
import type { BellPrescription } from '@/lib/goals';
import { BELL_SIZES, type BellSize } from '@/lib/types';

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
  bellPrescription?: BellPrescription | null;
}

export function TodayWorkout({ plan, todayStr, alreadyLogged, bellPrescription }: Props) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);

  // Pre-fill selectors from prescription when available
  const hasMixedBells = bellPrescription ? bellPrescription.lightRounds > 0 : false;
  const [selectedBell, setSelectedBell] = useState<BellSize | null>(
    bellPrescription
      ? hasMixedBells
        ? (bellPrescription.lightBell as BellSize)
        : (bellPrescription.heavyBell as BellSize)
      : null
  );
  const [selectedRounds, setSelectedRounds] = useState<number | null>(
    bellPrescription
      ? hasMixedBells
        ? bellPrescription.lightRounds
        : bellPrescription.totalRounds
      : null
  );
  const [secondaryBell, setSecondaryBell] = useState<BellSize | null>(
    bellPrescription && hasMixedBells ? (bellPrescription.heavyBell as BellSize) : null
  );
  const [secondaryRounds, setSecondaryRounds] = useState<number | null>(
    bellPrescription && hasMixedBells ? bellPrescription.heavyRounds : null
  );

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
    const hasSecondaryBell = secondaryBell !== null;
    const hasSecondaryRounds = secondaryRounds !== null;
    if (hasSecondaryBell !== hasSecondaryRounds) {
      alert('Select heavy-bell rounds or clear the heavy bell selection');
      return;
    }

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
          bell_size: selectedBell,
          ...(hasSecondaryBell && hasSecondaryRounds
            ? {
                secondary_bell_size: secondaryBell,
                secondary_rounds: secondaryRounds,
              }
            : {}),
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

      {/* Round guidance / Bell prescription */}
      {hasRounds && bellPrescription ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Today&apos;s Prescription</p>
          <p className="text-sm font-semibold text-blue-900">
            {bellPrescription.heavyRounds} rounds @ {bellPrescription.heavyBell}
            {bellPrescription.lightRounds > 0 && (
              <> + {bellPrescription.lightRounds} rounds @ {bellPrescription.lightBell}</>
            )}
            {' '}= {bellPrescription.totalRounds} total
          </p>
          <p className="text-[10px] text-blue-600 mt-0.5">
            Week {bellPrescription.weekNumber} of 8 toward 10 rounds @ {bellPrescription.heavyBell}
          </p>
        </div>
      ) : hasRounds ? (
        <p className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 mb-3">
          Repeat {minR}-{maxR} rounds
        </p>
      ) : null}

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
          <div className="flex gap-2 mb-3">
            {BELL_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setSelectedBell(selectedBell === size ? null : size)}
                className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
                  selectedBell === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
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
          {/* Secondary (heavier) bell — optional */}
          <div className="border border-dashed border-zinc-300 rounded-lg p-3 mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {bellPrescription ? '28 kg rounds' : 'Heavy bell (optional)'}
            </p>
            <div className="flex gap-2 mb-2">
              {BELL_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setSecondaryBell(secondaryBell === size ? null : size);
                    if (secondaryBell === size) setSecondaryRounds(null);
                  }}
                  className={`flex-1 h-10 rounded-lg font-semibold text-sm transition-colors ${
                    secondaryBell === size
                      ? 'bg-slate-700 text-white'
                      : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {secondaryBell && (
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: maxR }, (_, i) => i + 1).map(r => (
                  <button
                    key={r}
                    onClick={() => setSecondaryRounds(secondaryRounds === r ? null : r)}
                    className={`min-w-[44px] h-10 rounded-lg font-semibold text-sm transition-colors ${
                      secondaryRounds === r
                        ? 'bg-slate-700 text-white'
                        : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLog}
            disabled={isLogging || !selectedRounds || !selectedBell}
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
