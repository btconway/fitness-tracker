import { isDatabaseConfigured } from '@/lib/db';
import { Header } from '@/components/shell/Header';
import { BottomNav } from '@/components/shell/BottomNav';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border-2 border-amber-400 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            <h2 className="font-semibold text-amber-900">Database Not Configured</h2>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <p className="text-slate-700">
              Set the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">DATABASE_URL</code> environment variable to your Neon connection string.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Go to Vercel project settings</li>
              <li>Add <code className="bg-slate-100 px-1 rounded text-xs">DATABASE_URL</code></li>
              <li>Redeploy</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
