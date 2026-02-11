import { getCycleDay, getCycleWeek } from '@/lib/date';

export function Header() {
  const cycleDay = getCycleDay();
  const week = getCycleWeek(cycleDay);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="flex items-center justify-between px-4 h-12 max-w-lg mx-auto">
        <h1 className="text-base font-semibold text-slate-800">Armor Building</h1>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Day {cycleDay}/28 &middot; Week {week}
        </span>
      </div>
    </header>
  );
}
