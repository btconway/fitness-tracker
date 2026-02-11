'use client';

import { useRouter } from 'next/navigation';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Trash2 } from 'lucide-react';
import type { FitnessLog } from '@/lib/types';

interface Props {
  dateStr: string | null;
  logs: FitnessLog[];
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  WORKOUT: 'Workout',
  STEPS: 'Steps',
  WEIGHT: 'Weight',
  PULLUP: 'Pull-ups',
  PUSHUP: 'Push-ups',
};

const TYPE_BADGE: Record<string, string> = {
  WORKOUT: 'bg-blue-100 text-blue-700',
  STEPS: 'bg-amber-100 text-amber-700',
  WEIGHT: 'bg-purple-100 text-purple-700',
  PULLUP: 'bg-indigo-100 text-indigo-700',
  PUSHUP: 'bg-emerald-100 text-emerald-700',
};

export function DayDetail({ dateStr, logs, onClose }: Props) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm('Delete this log?')) return;
    try {
      const res = await fetch(`/api/log?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
        onClose();
      }
    } catch {
      alert('Error deleting');
    }
  }

  const dateLabel = dateStr
    ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <BottomSheet open={!!dateStr} onClose={onClose} title={dateLabel}>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No logs for this day.</p>
      ) : (
        <div className="space-y-3 py-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-start justify-between gap-2 bg-zinc-50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${TYPE_BADGE[log.type] || 'bg-slate-100 text-slate-600'}`}>
                  {TYPE_LABELS[log.type] || log.type}
                </span>
                <div className="mt-1 text-sm text-slate-700">
                  {log.type === 'WORKOUT' && log.rounds && <span>{log.rounds} rounds</span>}
                  {log.type === 'STEPS' && <span>{parseInt(log.value).toLocaleString()} steps</span>}
                  {log.type === 'WEIGHT' && <span>{parseFloat(log.value).toFixed(1)} lbs</span>}
                  {log.type === 'PULLUP' && log.pullup_sets && (
                    <span>Sets: {log.pullup_sets} ({log.pullup_sets.split(',').reduce((a, s) => a + parseInt(s.trim()), 0)} total)</span>
                  )}
                  {log.type === 'PUSHUP' && log.pushup_sets && (
                    <span>Sets: {log.pushup_sets} ({log.pushup_sets.split(',').reduce((a, s) => a + parseInt(s.trim()), 0)} total)</span>
                  )}
                </div>
                {log.note && <p className="text-xs text-slate-500 mt-1 italic">{log.note}</p>}
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Delete log"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
