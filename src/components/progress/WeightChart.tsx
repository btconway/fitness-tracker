import type { FitnessLog } from '@/lib/types';

interface Props {
  weightLogs: FitnessLog[];
}

export function WeightChart({ weightLogs }: Props) {
  if (weightLogs.length === 0) return null;

  const entries = weightLogs.slice(0, 10).reverse();
  const weights = entries.map(l => parseFloat(l.value));
  const goal = 190;
  const minW = Math.min(Math.min(...weights), goal);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 10;

  const goalPct = ((goal - minW) / range) * 80 + 20;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Weight Progress</h3>
      <div className="relative">
        <div className="flex items-end gap-1.5 h-28 relative">
          {entries.map((log, i) => {
            const w = parseFloat(log.value);
            const h = ((w - minW) / range) * 80 + 20;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-purple-500 rounded-t transition-all" style={{ height: `${h}%` }} />
                <span className="text-[9px] font-mono text-slate-500">{w.toFixed(0)}</span>
              </div>
            );
          })}
          {/* Goal line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400"
            style={{ bottom: `${goalPct}%` }}
          >
            <span className="absolute right-0 -top-3 text-[9px] font-semibold text-emerald-600 bg-white px-1">
              {goal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
