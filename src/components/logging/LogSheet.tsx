'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { LogType } from '@/lib/types';

interface Props {
  defaultDate: string;
}

export function LogSheet({ defaultDate }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LogType>('WORKOUT');
  const [date, setDate] = useState(defaultDate);
  const [rounds, setRounds] = useState('');
  const [steps, setSteps] = useState('');
  const [weight, setWeight] = useState('');
  const [pullupSets, setPullupSets] = useState('');
  const [pushupSets, setPushupSets] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setRounds('');
    setSteps('');
    setWeight('');
    setPullupSets('');
    setPushupSets('');
    setNote('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      date,
      type,
      value:
        type === 'WORKOUT' ? 'COMPLETED'
        : type === 'STEPS' ? steps
        : type === 'WEIGHT' ? weight
        : type === 'PULLUP' ? pullupSets
        : pushupSets,
      note: note || null,
    };

    if (type === 'WORKOUT' && rounds) payload.rounds = parseInt(rounds);
    if (type === 'PULLUP' && pullupSets) payload.pullup_sets = pullupSets;
    if (type === 'PUSHUP' && pushupSets) payload.pushup_sets = pushupSets;

    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        reset();
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to log entry');
      }
    } catch {
      alert('Error logging entry');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Log entry"
      >
        <Plus size={24} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Log Entry">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as LogType)}
                className={inputClass}
              >
                <option value="WORKOUT">Workout</option>
                <option value="STEPS">Steps</option>
                <option value="WEIGHT">Weight</option>
                <option value="PULLUP">Pull-ups</option>
                <option value="PUSHUP">Push-ups</option>
              </select>
            </div>
          </div>

          {type === 'WORKOUT' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rounds</label>
              <input
                type="number"
                min="1"
                max="30"
                value={rounds}
                onChange={e => setRounds(e.target.value)}
                placeholder="5"
                className={inputClass}
              />
            </div>
          )}

          {type === 'STEPS' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Steps</label>
              <input
                type="number"
                min="0"
                value={steps}
                onChange={e => setSteps(e.target.value)}
                placeholder="10000"
                className={inputClass}
                required
              />
            </div>
          )}

          {type === 'WEIGHT' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Weight (lbs)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="190.0"
                className={inputClass}
                required
              />
            </div>
          )}

          {type === 'PULLUP' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pull-up Sets</label>
              <input
                type="text"
                value={pullupSets}
                onChange={e => setPullupSets(e.target.value)}
                placeholder="5,4,3,2,1"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated reps per set</p>
            </div>
          )}

          {type === 'PUSHUP' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Push-up Sets</label>
              <input
                type="text"
                value={pushupSets}
                onChange={e => setPushupSets(e.target.value)}
                placeholder="15,15,15,15"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated reps per set</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {isSubmitting ? 'Logging...' : 'Log Entry'}
          </button>
        </form>
      </BottomSheet>
    </>
  );
}
