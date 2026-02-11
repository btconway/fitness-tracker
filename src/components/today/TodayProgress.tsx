import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  workout: boolean;
  steps: boolean;
  pullups: boolean;
  pushups: boolean;
  weight: boolean;
}

const items: { key: keyof Props; label: string; color: string }[] = [
  { key: 'workout', label: 'Workout', color: 'text-blue-600' },
  { key: 'steps', label: 'Steps', color: 'text-amber-500' },
  { key: 'pullups', label: 'Pullups', color: 'text-indigo-600' },
  { key: 'pushups', label: 'Pushups', color: 'text-emerald-500' },
  { key: 'weight', label: 'Weight', color: 'text-purple-500' },
];

export function TodayProgress(props: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {items.map(({ key, label, color }) => {
        const done = props[key];
        return (
          <div
            key={key}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
              done ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-slate-400'
            }`}
          >
            {done ? <CheckCircle2 size={14} /> : <Circle size={14} className={color} />}
            {label}
          </div>
        );
      })}
    </div>
  );
}
