import type { GoalSummary, GoalStatus } from '@/lib/goals';

interface Props {
  summary: GoalSummary;
}

const STATUS_COLORS: Record<GoalStatus['status'], { bg: string; bar: string; pill: string; text: string }> = {
  ahead: {
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
  },
  on_track: {
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
  },
  behind: {
    bg: 'bg-amber-50',
    bar: 'bg-amber-500',
    pill: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
  },
  way_behind: {
    bg: 'bg-red-50',
    bar: 'bg-red-500',
    pill: 'bg-red-100 text-red-700',
    text: 'text-red-700',
  },
  tracking: {
    bg: 'bg-slate-50',
    bar: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-600',
    text: 'text-slate-600',
  },
};

export function GoalDashboard({ summary }: Props) {
  const { goals, daysRemaining, weekNumber } = summary;

  return (
    <div className="space-y-3">
      {/* Countdown banner */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{daysRemaining} days to April 27</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Week {Math.min(weekNumber, 8)} of 8</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{daysRemaining}</p>
          <p className="text-[10px] text-slate-400">days left</p>
        </div>
      </div>

      {/* Goal cards */}
      {goals.map((goal, i) => {
        const colors = STATUS_COLORS[goal.status];
        return (
          <div key={i} className={`rounded-xl border border-zinc-200 p-4 ${colors.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-800">{goal.label}</h4>
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors.pill}`}>
                {goal.statusLabel}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${colors.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, goal.pctComplete))}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700">
                <strong>{goal.current}</strong> → {goal.target} {goal.unit}
              </span>
              <span className={`text-[10px] ${colors.text}`}>
                {goal.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
