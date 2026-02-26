import { fetchAllLogs } from '@/lib/data';
import { getTodayCST, getYearMonth } from '@/lib/date';
import { CalendarView } from '@/components/calendar/CalendarView';
import type { FitnessLog } from '@/lib/types';

export default async function CalendarPage() {
  const todayStr = getTodayCST();
  const currentMonth = getYearMonth(todayStr);

  let logs: FitnessLog[] = [];
  try {
    logs = await fetchAllLogs();
  } catch {
    logs = [];
  }

  return (
    <div>
      <CalendarView
        initialMonth={currentMonth}
        initialLogs={logs}
        todayStr={todayStr}
      />
    </div>
  );
}
