'use client';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Trash2 } from 'lucide-react';
import type { DayInfo } from './types';

const TYPE_LABELS: Record<string, string> = {
  WORKOUT: 'Workout',
  STEPS: 'Steps',
  WEIGHT: 'Weight',
  PULLUP: 'Pull-ups',
  PUSHUP: 'Push-ups',
};

const TYPE_BADGE: Record<string, string> = {
  WORKOUT: 'bg-blue-100 text-blue-700',
  STEPS: 'bg-amber-100 text-amber-700',
  WEIGHT: 'bg-purple-100 text-purple-700',
  PULLUP: 'bg-indigo-100 text-indigo-700',
  PUSHUP: 'bg-emerald-100 text-emerald-700',
};

const WORKOUT_BORDER: Record<string, string> = {
  AB_COMPLEX: 'border-l-blue-500',
  WALK_MOVEMENT: 'border-l-amber-500',
  HYPERTROPHY_PRESS: 'border-l-purple-500',
  RUCK: 'border-l-green-500',
  RECOVERY: 'border-l-slate-400',
};

interface Props {
  dayInfo: DayInfo | null;
  onClose: () => void;
  onDeleteLog: (id: number) => void;
}

export function DayDetail({ dayInfo, onClose, onDeleteLog }: Props) {
  if (!dayInfo) {
    return <BottomSheet open={false} onClose={onClose}><span /></BottomSheet>;
  }

  const dateLabel = new Date(`${dayInfo.date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  async function handleDelete(id: number) {
    if (!confirm('Delete this log?')) return;
    try {
      const res = await fetch(`/api/log?id=${id}`, { method: 'DELETE' });
      if (res.ok) onDeleteLog(id);
      else alert('Error deleting');
    } catch {
      alert('Error deleting');
    }
  }

  const borderColor = WORKOUT_BORDER[dayInfo.plan.type] || 'border-l-slate-400';
  const { plan, pullupDay, pushupDay } = dayInfo;

  return (
    <BottomSheet open={true} onClose={onClose} title={dateLabel}>
      {/* Prescribed Section */}
      {dayInfo.isProgramActive && (
        <div className="mb-4">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Prescribed
            {dayInfo.isProgramActive && (
              <span className="ml-2 normal-case tracking-normal text-slate-300">
                Day {dayInfo.cycleDay}/28 &middot; Week {dayInfo.cycleWeek}
              </span>
            )}
          </h3>

          {/* Workout Card */}
          <div className={`bg-white border border-zinc-200 border-l-4 ${borderColor} rounded-lg p-3 mb-2`}>
            <p className="text-sm font-semibold text-slate-800">{plan.title}</p>

            {plan.exercises.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {plan.exercises.map((ex, i) => (
                  <li key={i} className="text-xs text-slate-600 flex justify-between">
                    <span>{ex.name}</span>
                    <span className="font-mono font-semibold text-slate-800">{ex.reps}</span>
                  </li>
                ))}
              </ul>
            )}

            {plan.roundsRange && (
              <p className="text-xs font-medium text-blue-700 bg-blue-50 rounded px-2 py-1 mt-2 inline-block">
                {plan.roundsRange[0]}&ndash;{plan.roundsRange[1]} rounds
              </p>
            )}

            {plan.carries && (
              <p className="text-xs text-slate-500 mt-1.5">{plan.carries}</p>
            )}
          </div>

          {/* Pullup Card */}
          {!pullupDay.rest && pullupDay.sets.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
              <p className="text-xs font-semibold text-indigo-700">
                Fighter Pullups ({pullupDay.program} Day {pullupDay.day})
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Sets: {pullupDay.sets.join(', ')} ({pullupDay.sets.reduce((a, b) => a + b, 0)} total)
              </p>
            </div>
          )}
          {pullupDay.rest && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 mb-2">
              <p className="text-xs text-indigo-400 italic">Pullups: Rest day</p>
            </div>
          )}

          {/* Pushup Card */}
          {!pushupDay.rest && pushupDay.sets.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2">
              <p className="text-xs font-semibold text-emerald-700">
                Fighter Pushups ({pushupDay.program} Day {pushupDay.day})
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Sets: {pushupDay.sets.join(', ')} ({pushupDay.sets.reduce((a, b) => a + b, 0)} total)
              </p>
            </div>
          )}
          {pushupDay.rest && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 mb-2">
              <p className="text-xs text-emerald-400 italic">Pushups: Rest day</p>
            </div>
          )}

          {/* Steps Goal */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              Steps Goal: {plan.stepsGoal.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Logged Section */}
      {!dayInfo.isFuture && (
        <div>
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Logged
          </h3>
          {dayInfo.logs.length === 0 ? (
            <p className="text-sm text-slate-400 py-3 text-center">Nothing logged</p>
          ) : (
            <div className="space-y-2 pb-2">
              {dayInfo.logs.map(log => (
                <div key={log.id} className="flex items-start justify-between gap-2 bg-zinc-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${TYPE_BADGE[log.type] || 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_LABELS[log.type] || log.type}
                    </span>
                    <div className="mt-1 text-sm text-slate-700">
                      {log.type === 'WORKOUT' && log.rounds && <span>{log.rounds} rounds</span>}
                      {log.type === 'STEPS' && <span>{parseInt(log.value).toLocaleString()} steps</span>}
                      {log.type === 'WEIGHT' && <span>{parseFloat(log.value).toFixed(1)} lbs</span>}
                      {log.type === 'PULLUP' && log.pullup_sets && (
                        <span>Sets: {log.pullup_sets} ({log.pullup_sets.split(',').reduce((a, s) => a + parseInt(s.trim()), 0)} total)</span>
                      )}
                      {log.type === 'PUSHUP' && log.pushup_sets && (
                        <span>Sets: {log.pushup_sets} ({log.pushup_sets.split(',').reduce((a, s) => a + parseInt(s.trim()), 0)} total)</span>
                      )}
                    </div>
                    {log.note && <p className="text-xs text-slate-500 mt-1 italic">{log.note}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    aria-label="Delete log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
