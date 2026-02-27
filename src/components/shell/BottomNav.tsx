'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, CalendarDays, TrendingUp } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Today', icon: Dumbbell },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-center gap-2 px-4 sm:px-6">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-full max-w-40 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
