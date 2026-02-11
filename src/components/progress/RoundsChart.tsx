import type { FitnessLog } from '@/lib/types';

interface Props {
  roundsLogs: FitnessLog[];
}

export function RoundsChart({ roundsLogs }: Props) {
  if (roundsLogs.length === 0) return null;

  const entries = roundsLogs.slice(0, 10).reverse();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Rounds Progress</h3>
      <div className="flex items-end gap-1.5 h-28">
        {entries.map((log, i) => {
          const rounds = log.rounds || 0;
          const h = (rounds / 10) * 100;
          const color = rounds >= 5 ? 'bg-emerald-500' : rounds >= 3 ? 'bg-blue-500' : 'bg-amber-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full ${color} rounded-t transition-all`} style={{ height: `${h}%` }} />
              <span className="text-[9px] font-mono text-slate-500">{rounds}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded" /><span>5+ (prescribed)</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded" /><span>3-4</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded" /><span>&lt;3</span></div>
      </div>
    </div>
  );
}
