'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export function LogForm({ onSuccess }: { onSuccess?: () => void }) {
  const [type, setType] = useState<'WORKOUT' | 'STEPS'>('WORKOUT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rounds, setRounds] = useState('');
  const [steps, setSteps] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        date,
        type,
        value: type === 'WORKOUT' ? 'COMPLETED' : steps,
        note: note || null,
      };

      if (type === 'WORKOUT' && rounds) {
        payload.rounds = parseInt(rounds);
      }

      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Reset form
        setRounds('');
        setSteps('');
        setNote('');
        if (onSuccess) onSuccess();
        window.location.reload();
      } else {
        alert('Failed to log entry');
      }
    } catch (error) {
      alert('Error logging entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-blue-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Plus className="text-blue-600" size={20} />
          Log Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'WORKOUT' | 'STEPS')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WORKOUT">Workout</option>
                <option value="STEPS">Steps</option>
              </select>
            </div>
          </div>

          {type === 'WORKOUT' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rounds Completed
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {type === 'STEPS' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Steps
              </label>
              <input
                type="number"
                min="0"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={type === 'STEPS'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Bar hang 60s, goblet squat 60s"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging...' : 'Log Entry'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
