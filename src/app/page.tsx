import { sql } from '@/lib/db';
import { ABF4FL_PROGRAM } from '@/lib/program';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Trophy, Flame } from 'lucide-react';

export default async function Dashboard() {
  let logs: any[] = [];
  
  try {
    if (process.env.DATABASE_URL) {
      logs = await sql`SELECT * FROM fitness_logs ORDER BY date DESC`;
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error);
  }
  
  const startDate = new Date('2026-02-10');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = (diffDays % 28);
  const todaysPlan = ABF4FL_PROGRAM[currentDay];

  const completedWorkouts = logs.filter(l => l.type === 'WORKOUT' && l.value === 'COMPLETED').length;
  const totalSteps = logs.filter(l => l.type === 'STEPS').reduce((acc, curr) => acc + parseInt(curr.value), 0);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Armor Building</h1>
          <p className="text-muted-foreground text-lg">Dan John ABF4FL Tracker</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Cycle Progress</p>
          <p className="text-2xl font-mono">Day {currentDay + 1} / 28</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium opacity-80">Streak</p>
                <p className="text-3xl font-bold">{completedWorkouts} Days</p>
              </div>
              <Flame size={40} className="opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Steps</p>
                <p className="text-3xl font-bold">{totalSteps.toLocaleString()}</p>
              </div>
              <Trophy size={40} className="text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workouts</p>
                <p className="text-3xl font-bold">{completedWorkouts}</p>
              </div>
              <CheckCircle2 size={40} className="text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs uppercase">Today</span>
            {todaysPlan?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {todaysPlan?.exercises.map((ex, i) => (
              <li key={i} className="flex justify-between border-b pb-1">
                <span>{ex.name}</span>
                <span className="font-mono font-bold text-primary">{ex.reps}</span>
              </li>
            ))}
          </ul>
          {todaysPlan?.carries && (
            <div className="bg-muted p-3 rounded-md text-sm italic mb-4">
              {todaysPlan.carries}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Circle size={16} className="text-primary fill-primary" />
            {todaysPlan?.notes}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Logs</h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="p-4 flex justify-between items-center border-b last:border-0">
              <div>
                <p className="font-bold uppercase text-xs text-muted-foreground">{log.type}</p>
                <p>{log.note || log.value}</p>
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                {new Date(log.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
