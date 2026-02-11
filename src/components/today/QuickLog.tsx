'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  todayStr: string;
  todayTotal: number;
}

export function QuickLog({ todayStr, todayTotal }: Props) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);

  async function handleQuick(reps: number) {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'PUSHUP',
          value: reps.toString(),
          pushup_sets: reps.toString(),
          note: null,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log');
    } catch {
      alert('Error logging');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 text-sm">Push-ups (GTG)</h3>
        <span className="text-xs text-emerald-600 font-medium">
          {todayTotal > 0 ? `${todayTotal} today` : ''}
        </span>
      </div>
      <div className="flex gap-2">
        {[10, 15, 20, 25].map(reps => (
          <button
            key={reps}
            onClick={() => handleQuick(reps)}
            disabled={isLogging}
            className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {reps}
          </button>
        ))}
      </div>
    </div>
  );
}
