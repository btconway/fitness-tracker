'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  todayStr: string;
  alreadyLogged: boolean;
  lastWeight: number | null;
}

export function StepsLogger({ todayStr, alreadyLogged, lastWeight }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState('');
  const [weight, setWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  async function logEntry(type: 'STEPS' | 'WEIGHT', value: string) {
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr, type, value, note: null }),
      });
      if (res.ok) {
        if (type === 'STEPS') setSteps('');
        else setWeight('');
        router.refresh();
      }
    } catch {
      alert('Error logging');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Steps */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">Steps</label>
        {alreadyLogged ? (
          <p className="text-xs text-emerald-600 font-medium mt-1">Logged today</p>
        ) : (
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="10000"
              className="flex-1 min-w-0 px-2 py-1.5 border border-zinc-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => steps && logEntry('STEPS', steps)}
              disabled={isLogging || !steps}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg disabled:opacity-40"
            >
              Log
            </button>
          </div>
        )}
      </div>

      {/* Weight */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">Weight</label>
        <div className="flex gap-1">
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={lastWeight ? lastWeight.toFixed(1) : '190.0'}
            className="flex-1 min-w-0 px-2 py-1.5 border border-zinc-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => weight && logEntry('WEIGHT', weight)}
            disabled={isLogging || !weight}
            className="px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg disabled:opacity-40"
          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}
