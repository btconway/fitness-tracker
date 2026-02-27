'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BELL_SIZES, type BellSize, type LogType } from '@/lib/types';

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
  const [swingSets, setSwingSets] = useState('');
  const [bellSize, setBellSize] = useState<BellSize | null>(null);
  const [secondaryBellSize, setSecondaryBellSize] = useState<BellSize | null>(null);
  const [secondaryRounds, setSecondaryRounds] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setRounds('');
    setSteps('');
    setWeight('');
    setPullupSets('');
    setPushupSets('');
    setSwingSets('');
    setBellSize(null);
    setSecondaryBellSize(null);
    setSecondaryRounds('');
    setNote('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (type === 'WORKOUT') {
      const hasSecondaryBell = secondaryBellSize !== null;
      const hasSecondaryRounds = secondaryRounds.trim() !== '';
      if (hasSecondaryBell !== hasSecondaryRounds) {
        alert('Select rounds for the heavy bell or clear the heavy bell selection');
        return;
      }
    }

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      date,
      type,
      value:
        type === 'WORKOUT' ? 'COMPLETED'
        : type === 'STEPS' ? steps
        : type === 'WEIGHT' ? weight
        : type === 'PULLUP' ? pullupSets
        : type === 'PUSHUP' ? pushupSets
        : type === 'SWING' ? swingSets
        : '',
      note: note || null,
    };

    if (type === 'WORKOUT' && rounds) payload.rounds = parseInt(rounds);
    if (type === 'WORKOUT' && bellSize) payload.bell_size = bellSize;
    if (type === 'WORKOUT' && secondaryBellSize && secondaryRounds) {
      payload.secondary_bell_size = secondaryBellSize;
      payload.secondary_rounds = parseInt(secondaryRounds);
    }
    if (type === 'PULLUP' && pullupSets) payload.pullup_sets = pullupSets;
    if (type === 'PUSHUP' && pushupSets) payload.pushup_sets = pushupSets;
    if (type === 'SWING' && swingSets) { payload.swing_sets = swingSets; payload.bell_size = '28 kg'; }

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
                <option value="SWING">KB Swings</option>
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

          {type === 'WORKOUT' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bell Size</label>
              <div className="flex gap-2">
                {BELL_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBellSize(bellSize === size ? null : size)}
                    className={`flex-1 h-11 rounded-lg font-semibold text-sm transition-colors ${
                      bellSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'WORKOUT' && (
            <div className="border border-dashed border-zinc-300 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Heavy bell (optional)</p>
              <div className="flex gap-2 mb-2">
                {BELL_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSecondaryBellSize(secondaryBellSize === size ? null : size);
                      if (secondaryBellSize === size) setSecondaryRounds('');
                    }}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition-colors ${
                      secondaryBellSize === size
                        ? 'bg-slate-700 text-white'
                        : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {secondaryBellSize && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Rounds at heavy bell</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={secondaryRounds}
                    onChange={e => setSecondaryRounds(e.target.value)}
                    placeholder="1"
                    className={inputClass}
                  />
                </div>
              )}
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

          {type === 'SWING' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Swing Sets</label>
              <input
                type="text"
                value={swingSets}
                onChange={e => setSwingSets(e.target.value)}
                placeholder="25,25,25"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated reps per set (28 kg)</p>
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
