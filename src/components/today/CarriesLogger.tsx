'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { FitnessLog } from '@/lib/types';

const BELL_SIZES = ['24 kg', '28 kg', '32 kg'] as const;
type BellSize = typeof BELL_SIZES[number];

interface Props {
  carryDescription: string;
  carryType: 'FARMER' | 'SUITCASE' | 'RACKED';
  todayStr: string;
  alreadyLogged: FitnessLog | null;
}

export function CarriesLogger({ carryDescription, carryType, todayStr, alreadyLogged }: Props) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<BellSize | null>(
    alreadyLogged ? (alreadyLogged.value as BellSize) : null
  );
  const [isLogging, setIsLogging] = useState(false);

  const carryLabel = carryType === 'FARMER' ? 'Farmer Carries'
    : carryType === 'SUITCASE' ? 'Suitcase Carries'
    : 'Racked Carries';

  async function handleLog() {
    if (isLogging || !selectedSize) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          type: 'CARRIES',
          value: selectedSize,
          note: carryLabel,
        }),
      });
      if (res.ok) router.refresh();
      else alert('Failed to log carries');
    } catch {
      alert('Error logging carries');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-orange-400 p-4 relative">
      {alreadyLogged && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      )}

      <h3 className="font-semibold text-slate-800 text-sm mb-2">{carryLabel}</h3>
      <p className="text-xs text-slate-600 bg-zinc-50 rounded-lg px-3 py-2 mb-3">
        {carryDescription}
      </p>

      {alreadyLogged ? (
        <p className="text-xs text-emerald-600 font-medium">
          Logged with {alreadyLogged.value}
        </p>
      ) : (
        <>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Bell Size</p>
          <div className="flex gap-2 mb-3">
            {BELL_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
                  selectedSize === size
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            onClick={handleLog}
            disabled={isLogging || !selectedSize}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {isLogging ? 'Logging...' : 'Log Carries'}
          </button>
        </>
      )}
    </div>
  );
}
