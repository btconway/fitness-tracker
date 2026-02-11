import { sql } from '@/lib/db';
import { ABF4FL_PROGRAM } from '@/lib/program';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LogForm } from '@/components/LogForm';
import { CheckCircle2, Circle, Trophy, Flame, TrendingUp, Target, Scale } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const logs = await sql`SELECT * FROM fitness_logs ORDER BY date DESC, created_at DESC`;
  
  // Calculate current day in CST
  const startDate = new Date('2026-02-10T00:00:00-06:00');
  const nowUTC = new Date();
  // Get CST date string (format: MM/DD/YYYY)
  const cstDateStr = nowUTC.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
  const [month, day, year] = cstDateStr.split('/');
  const nowCST = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const diffTime = Math.abs(nowCST.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = (diffDays % 28);
  const todaysPlan = ABF4FL_PROGRAM[currentDay];

  const completedWorkouts = logs.filter(l => l.type === 'WORKOUT' && l.value === 'COMPLETED').length;
  const totalSteps = logs.filter(l => l.type === 'STEPS').reduce((acc, curr) => acc + parseInt(curr.value), 0);
  
  // Calculate rounds stats
  const workoutLogs = logs.filter(l => l.type === 'WORKOUT' && l.rounds);
  const averageRounds = workoutLogs.length > 0 
    ? (workoutLogs.reduce((acc, curr) => acc + (curr.rounds || 0), 0) / workoutLogs.length).toFixed(1)
    : 0;
  
  // Get recent rounds for mini progress indicator
  const recentRounds = workoutLogs.slice(0, 10).reverse();

  // Calculate "as prescribed" percentage
  const prescribedWorkouts = workoutLogs.filter(l => (l.rounds || 0) >= 5).length;
  const prescribedPercentage = workoutLogs.length > 0 
    ? Math.round((prescribedWorkouts / workoutLogs.length) * 100) 
    : 0;

  // Weight tracking
  const weightLogs = logs.filter(l => l.type === 'WEIGHT');
  const latestWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].value) : null;
  const startWeight = weightLogs.length > 0 ? parseFloat(weightLogs[weightLogs.length - 1].value) : null;
  const weightChange = latestWeight && startWeight ? (latestWeight - startWeight).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">Armor Building</h1>
            <p className="text-slate-600 text-lg">Dan John ABF4FL Tracker</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Cycle Progress</p>
            <p className="text-2xl font-mono text-blue-600">Day {currentDay + 1} / 28</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-90">Streak</p>
                  <p className="text-3xl font-bold">{completedWorkouts}</p>
                  <p className="text-xs opacity-75 mt-1">days</p>
                </div>
                <Flame size={40} className="opacity-40" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Steps</p>
                  <p className="text-3xl font-bold text-slate-800">{totalSteps.toLocaleString()}</p>
                </div>
                <Trophy size={40} className="text-amber-400 opacity-40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Rounds</p>
                  <p className="text-3xl font-bold text-slate-800">{averageRounds}</p>
                </div>
                <TrendingUp size={40} className="text-emerald-500 opacity-40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">As Prescribed</p>
                  <p className="text-3xl font-bold text-slate-800">{prescribedPercentage}%</p>
                </div>
                <Target size={40} className="text-blue-500 opacity-40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-600">Current Weight</p>
                  {latestWeight ? (
                    <>
                      <p className="text-3xl font-bold text-slate-800">{latestWeight}</p>
                      {weightChange && (
                        <p className="text-xs text-slate-500 mt-1">
                          {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} lbs
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xl text-slate-400">No data</p>
                  )}
                </div>
                <Scale size={40} className="text-purple-500 opacity-40" />
              </div>
            </CardContent>
          </Card>
        </div>

        <LogForm />

        {/* Weight Progress */}
        {weightLogs.length > 0 && (
          <Card className="bg-white border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Scale className="text-purple-600" size={20} />
                Weight Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {weightLogs.slice(0, 10).reverse().map((log, i) => {
                  const weight = parseFloat(log.value);
                  const minWeight = Math.min(...weightLogs.map(l => parseFloat(l.value)));
                  const maxWeight = Math.max(...weightLogs.map(l => parseFloat(l.value)));
                  const range = maxWeight - minWeight || 10; // Default range if all same
                  const height = ((weight - minWeight) / range) * 80 + 20; // 20-100% scale
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-purple-500 rounded-t-md transition-all" 
                        style={{ height: `${height}%` }} 
                      />
                      <span className="text-xs font-mono text-slate-600">{weight.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
              {weightChange && (
                <div className="mt-4 text-sm text-slate-600">
                  <span className="font-semibold">
                    {parseFloat(weightChange) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(weightChange))} lbs
                  </span>
                  {' '}since start
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rounds Progress */}
        {recentRounds.length > 0 && (
          <Card className="bg-white border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20} />
                Rounds Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {recentRounds.map((log, i) => {
                  const rounds = log.rounds || 0;
                  const height = (rounds / 6) * 100; // Scale to 6 max rounds
                  const color = rounds >= 5 ? 'bg-emerald-500' : rounds >= 3 ? 'bg-blue-500' : 'bg-amber-500';
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full ${color} rounded-t-md transition-all`} style={{ height: `${height}%` }} />
                      <span className="text-xs font-mono text-slate-600">{rounds}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded" />
                  <span>5+ rounds (prescribed)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>3-4 rounds</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span>&lt;3 rounds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-blue-400 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs uppercase font-bold">Today</span>
              {todaysPlan?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2 mb-4">
              {todaysPlan?.exercises.map((ex, i) => (
                <li key={i} className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-slate-700">{ex.name}</span>
                  <span className="font-mono font-bold text-blue-600">{ex.reps}</span>
                </li>
              ))}
            </ul>
            {todaysPlan?.carries && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm italic mb-4 text-slate-700">
                {todaysPlan.carries}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Circle size={16} className="text-blue-500 fill-blue-500" />
              {todaysPlan?.notes}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Logs</h2>
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-md">
            {logs.slice(0, 10).map((log, i) => (
              <div key={i} className="p-4 flex justify-between items-center border-b border-blue-100 last:border-0 hover:bg-blue-50 transition-colors">
                <div className="flex-1">
                  <p className="font-bold uppercase text-xs text-blue-600 mb-1">{log.type}</p>
                  {log.rounds && (
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{log.rounds} rounds</span>
                      {log.rounds >= 5 ? ' ✓ As prescribed' : log.rounds >= 3 ? ' (Solid)' : ' (Keep building)'}
                    </p>
                  )}
                  {log.note && <p className="text-sm text-slate-600 mt-1">{log.note}</p>}
                  {log.type === 'STEPS' && <p className="text-sm text-slate-700">{parseInt(log.value).toLocaleString()} steps</p>}
                  {log.type === 'WEIGHT' && <p className="text-sm text-slate-700">{parseFloat(log.value).toFixed(1)} lbs</p>}
                </div>
                <p className="text-sm font-mono text-slate-500 ml-4">
                  {new Date(log.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
