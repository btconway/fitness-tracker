import { CheckCircle2, Circle } from 'lucide-react';

type Status = 'none' | 'partial' | 'done';

interface Props {
  workout: Status;
  steps: Status;
  pullups: Status;
  pushups: Status;
  weight: Status;
}

const items: { key: keyof Props; label: string }[] = [
  { key: 'workout', label: 'Workout' },
  { key: 'steps', label: 'Steps' },
  { key: 'pullups', label: 'Pullups' },
  { key: 'pushups', label: 'Pushups' },
  { key: 'weight', label: 'Weight' },
];

const statusStyles: Record<Status, { bg: string; text: string; icon: string }> = {
  none: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-400' },
  partial: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
  done: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
};

export function TodayProgress(props: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {items.map(({ key, label }) => {
        const status = props[key];
        const style = statusStyles[status];
        return (
          <div
            key={key}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${style.bg} ${style.text}`}
          >
            {status === 'done' ? (
              <CheckCircle2 size={14} />
            ) : (
              <Circle size={14} className={style.icon} />
            )}
            {label}
          </div>
        );
      })}
    </div>
  );
}
