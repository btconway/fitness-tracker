import { fetchLogsByMonth } from '@/lib/data';
import { getTodayCST, getYearMonth } from '@/lib/date';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import type { FitnessLog } from '@/lib/types';

export default async function CalendarPage() {
  const todayStr = getTodayCST();
  const currentMonth = getYearMonth(todayStr);

  let logs: FitnessLog[] = [];
  try {
    logs = await fetchLogsByMonth(currentMonth);
  } catch {
    logs = [];
  }

  return (
    <div>
      <CalendarGrid
        initialMonth={currentMonth}
        initialLogs={logs}
        todayStr={todayStr}
      />
    </div>
  );
}
