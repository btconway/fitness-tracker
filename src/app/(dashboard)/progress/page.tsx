import { fetchAllLogs, computeMetrics } from '@/lib/data';
import { StatCard } from '@/components/progress/StatCard';
import { WeightChart } from '@/components/progress/WeightChart';
import { RoundsChart } from '@/components/progress/RoundsChart';

export default async function ProgressPage() {
  let logs;
  try {
    logs = await fetchAllLogs();
  } catch {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-4 text-sm text-red-700">
        <p className="font-semibold">Database Error</p>
      </div>
    );
  }

  const {
    streak,
    totalWorkouts,
    averageRounds,
    prescribedPct,
    weightLogs,
    latestWeight,
    weightChange,
    lifetimePullups,
    lifetimePushups,
  } = computeMetrics(logs);

  const roundsLogs = logs.filter(l => l.type === 'WORKOUT' && l.rounds);
  const recentLogs = logs.slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Streak" value={streak} subtitle="days" color="text-blue-600" />
        <StatCard label="Total Workouts" value={totalWorkouts} />
        <StatCard label="Avg Rounds" value={averageRounds} />
        <StatCard label="As Prescribed" value={`${prescribedPct}%`} subtitle="5+ rounds" />
      </div>

      {/* Weight */}
      <WeightChart weightLogs={weightLogs} />
      {latestWeight && weightChange !== null && (
        <div className="bg-white rounded-xl border border-zinc-200 p-3 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            Current: <strong>{latestWeight.toFixed(1)} lbs</strong>
          </span>
          <span className="text-xs text-slate-500">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs since start
            {latestWeight > 190 && (
              <span className="text-emerald-600 ml-1">({(latestWeight - 190).toFixed(1)} to goal)</span>
            )}
          </span>
        </div>
      )}

      {/* Rounds */}
      <RoundsChart roundsLogs={roundsLogs} />

      {/* Lifetime totals */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Lifetime Pull-ups" value={lifetimePullups} color="text-indigo-600" />
        <StatCard label="Lifetime Push-ups" value={lifetimePushups} color="text-emerald-600" />
      </div>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 pt-3 pb-2">Recent Logs</h3>
          {recentLogs.map((log, i) => (
            <div key={i} className="px-4 py-2 flex justify-between items-center border-t border-zinc-100 text-sm">
              <div>
                <span className="text-[10px] font-semibold uppercase text-blue-600">{log.type}</span>
                {log.type === 'WORKOUT' && log.rounds && (
                  <span className="ml-2 text-slate-700">{log.rounds} rounds</span>
                )}
                {log.type === 'STEPS' && (
                  <span className="ml-2 text-slate-700">{parseInt(log.value).toLocaleString()} steps</span>
                )}
                {log.type === 'WEIGHT' && (
                  <span className="ml-2 text-slate-700">{parseFloat(log.value).toFixed(1)} lbs</span>
                )}
                {log.type === 'PULLUP' && log.pullup_sets && (
                  <span className="ml-2 text-slate-700">{log.pullup_sets}</span>
                )}
                {log.type === 'PUSHUP' && log.pushup_sets && (
                  <span className="ml-2 text-slate-700">{log.pushup_sets}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{log.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
