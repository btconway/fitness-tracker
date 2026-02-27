import { getCycleDay, getCycleWeek, getTodayCST } from '@/lib/date';
import { daysUntil } from '@/lib/goals';

export function Header() {
  const cycleDay = getCycleDay();
  const week = getCycleWeek(cycleDay);
  const remaining = daysUntil(getTodayCST());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
        <h1 className="text-base font-semibold text-slate-800">Armor Building</h1>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Day {cycleDay}/28 &middot; Week {week} &middot; {remaining}d to goal
        </span>
      </div>
    </header>
  );
}
