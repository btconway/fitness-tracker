import { getTodayContext } from '@/lib/data';
import { TodayWorkout } from '@/components/today/TodayWorkout';
import { FighterPullup } from '@/components/today/FighterPullup';
import { QuickLog } from '@/components/today/QuickLog';
import { StepsLogger } from '@/components/today/StepsLogger';
import { TodayProgress } from '@/components/today/TodayProgress';
import { LogSheet } from '@/components/logging/LogSheet';

export default async function TodayPage() {
  let ctx;
  try {
    ctx = await getTodayContext();
  } catch (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-4 text-sm text-red-700">
        <p className="font-semibold mb-1">Database Error</p>
        <p className="text-xs text-red-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const {
    todayStr,
    plan,
    pullupDay,
    todayWorkout,
    todaySteps,
    todayWeight,
    todayPullupSets,
    todayPullupTotal,
    todayPushupTotal,
    lastWeight,
  } = ctx;

  return (
    <div className="space-y-3">
      <TodayProgress
        workout={!!todayWorkout}
        steps={!!todaySteps}
        pullups={todayPullupSets.length > 0}
        pushups={todayPushupTotal > 0}
        weight={!!todayWeight}
      />

      <TodayWorkout
        plan={plan}
        todayStr={todayStr}
        alreadyLogged={!!todayWorkout}
      />

      <FighterPullup
        pullupDay={pullupDay}
        todayStr={todayStr}
        todaySets={todayPullupSets}
        todayTotal={todayPullupTotal}
      />

      <QuickLog todayStr={todayStr} todayTotal={todayPushupTotal} />

      <StepsLogger
        todayStr={todayStr}
        alreadyLogged={!!todaySteps}
        lastWeight={lastWeight}
      />

      <LogSheet defaultDate={todayStr} />
    </div>
  );
}
