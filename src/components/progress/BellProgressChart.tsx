import type { FitnessLog } from '@/lib/types';

interface Props {
  logs: FitnessLog[];
}

export function BellProgressChart({ logs }: Props) {
  const workoutLogs = logs
    .filter(l => l.type === 'WORKOUT' && l.bell_size)
    .slice(0, 10)
    .reverse();

  if (workoutLogs.length === 0) return null;

  const GOAL = 10;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Bell Progression</h3>
      <p className="text-[10px] text-slate-400 mb-3">Rounds at heaviest bell per session</p>
      <div className="relative flex gap-1.5 h-28">
        {/* Goal line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-slate-400 pointer-events-none"
          style={{ bottom: '100%', marginBottom: '-2px' }}
        />
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ bottom: '100%', marginBottom: '4px' }}
        >
          <span className="text-[9px] text-slate-400 font-medium">Goal: 10 rounds @ 28 kg</span>
        </div>
        {workoutLogs.map((log, i) => {
          const hasSecondaryPair =
            !!log.secondary_bell_size &&
            typeof log.secondary_rounds === 'number' &&
            log.secondary_rounds > 0;
          const heavyRounds = hasSecondaryPair ? Number(log.secondary_rounds) : Number(log.rounds ?? 0);
          const heavyBell = hasSecondaryPair ? log.secondary_bell_size : log.bell_size;
          const h = (heavyRounds / GOAL) * 100;
          const date = log.date.slice(5); // MM-DD
          const dateLabel = date.replace('-', '/');

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="flex-1 relative w-full">
                {/* Goal line at top of container */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-slate-300"
                  style={{ top: 0 }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 bg-slate-600 rounded-t transition-all"
                  style={{ height: `${Math.min(h, 100)}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-500 shrink-0">{heavyRounds}</span>
              <span className="text-[8px] text-slate-400 shrink-0 leading-none">{heavyBell?.replace(' kg', '')}</span>
              <span className="text-[8px] text-slate-400 shrink-0 leading-none">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
