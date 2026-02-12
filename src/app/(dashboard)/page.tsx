import { getTodayContext } from '@/lib/data';
import { TodayWorkout } from '@/components/today/TodayWorkout';
import { FighterPullup } from '@/components/today/FighterPullup';
import { FighterPushup } from '@/components/today/FighterPushup';

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
    pushupDay,
    todayWorkout,
    todaySteps,
    todayWeight,
    todayPullupSets,
    todayPullupTotal,
    todayPushupSets,
    todayPushupTotal,
    lastWeight,
  } = ctx;

  // Compute tri-state completion for pullups/pushups
  function getSetStatus(prescribedSets: number[], loggedSets: number[]): 'none' | 'partial' | 'done' {
    if (prescribedSets.length === 0) return 'done'; // rest day or no program
    if (loggedSets.length === 0) return 'none';
    // Check if all prescribed sets are matched
    const remaining = [...prescribedSets];
    for (const logged of loggedSets) {
      const idx = remaining.indexOf(logged);
      if (idx !== -1) remaining.splice(idx, 1);
    }
    return remaining.length === 0 ? 'done' : 'partial';
  }

  const pullupStatus = pullupDay.rest ? 'done' : getSetStatus(pullupDay.sets, todayPullupSets);
  const pushupStatus = pushupDay.rest ? 'done' : getSetStatus(pushupDay.sets, todayPushupSets);

  return (
    <div className="space-y-3">
      <TodayProgress
        workout={!!todayWorkout ? 'done' : 'none'}
        steps={!!todaySteps ? 'done' : 'none'}
        pullups={pullupStatus}
        pushups={pushupStatus}
        weight={!!todayWeight ? 'done' : 'none'}
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

      <FighterPushup
        pushupDay={pushupDay}
        todayStr={todayStr}
        todaySets={todayPushupSets}
        todayTotal={todayPushupTotal}
      />

      <StepsLogger
        todayStr={todayStr}
        alreadyLogged={!!todaySteps}
        lastWeight={lastWeight}
      />

      <LogSheet defaultDate={todayStr} />
    </div>
  );
}
