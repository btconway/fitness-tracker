'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dumbbell, Plus } from 'lucide-react';

type QuickLogType = 'PUSHUP' | 'PULLUP';

interface QuickLogProps {
  todaySets?: { type: string; sets: number[]; total: number }[];
}

export function QuickLog({ todaySets = [] }: QuickLogProps) {
  const [isLogging, setIsLogging] = useState(false);

  const pushupSets = todaySets.find(s => s.type === 'PUSHUP');
  const pullupSets = todaySets.find(s => s.type === 'PULLUP');

  const handleQuickLog = async (type: QuickLogType, reps: number) => {
    setIsLogging(true);
    
    try {
      const now = new Date();
      const cstDateStr = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' });
      const [month, day, year] = cstDateStr.split('/');
      const date = `${year}-${month}-${day}`;
      
      const fieldName = type === 'PUSHUP' ? 'pushup_sets' : 'pullup_sets';
      
      const payload = {
        date,
        type,
        value: reps.toString(),
        [fieldName]: reps.toString(),
        note: null
      };

      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to log set');
      }
    } catch (error) {
      alert('Error logging set');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Dumbbell className="text-emerald-600" size={20} />
          Quick Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Push-ups */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">Push-ups (GTG)</h3>
            {pushupSets && (
              <span className="text-xs text-emerald-600 font-medium">
                Today: {pushupSets.total} reps ({pushupSets.sets.length} sets)
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[10, 15, 20, 25].map(reps => (
              <button
                key={reps}
                onClick={() => handleQuickLog('PUSHUP', reps)}
                disabled={isLogging}
                className="flex-1 min-w-[60px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reps}
              </button>
            ))}
          </div>
        </div>

        {/* Pull-ups */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">Pull-ups</h3>
            {pullupSets && (
              <span className="text-xs text-indigo-600 font-medium">
                Today: {pullupSets.total} reps ({pullupSets.sets.length} sets)
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[3, 4, 5, 6, 7].map(reps => (
              <button
                key={reps}
                onClick={() => handleQuickLog('PULLUP', reps)}
                disabled={isLogging}
                className="flex-1 min-w-[50px] bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reps}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic text-center">
          Click a button to instantly log that set for today
        </p>
      </CardContent>
    </Card>
  );
}
