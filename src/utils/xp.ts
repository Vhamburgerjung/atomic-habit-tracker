import type { CheckOff } from '../store/useHabitStore';

const BASE_XP = 10;
const FIRST_CHECKOFF_BONUS = 50;

export function xpForCheckOff(streak: number): number {
  return xpForStreak(streak);
}

function xpForStreak(streak: number): number {
  if (streak >= 90) return Math.round(BASE_XP * 3);
  if (streak >= 30) return Math.round(BASE_XP * 2);
  if (streak >= 7) return Math.round(BASE_XP * 1.5);
  return BASE_XP;
}

export function computeHabitXP(checkoffs: CheckOff[]): number {
  const uniqueDays = [
    ...new Set(checkoffs.map((c) => new Date(c.completedAt).toDateString())),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let total = 0;
  let streak = 0;

  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
      streak = diff === 1 ? streak + 1 : 1;
    }
    total += xpForStreak(streak);
  }

  return total;
}

export function computeTotalXP(allCheckoffs: CheckOff[]): number {
  if (allCheckoffs.length === 0) return 0;

  const byHabit = new Map<string, CheckOff[]>();
  for (const c of allCheckoffs) {
    if (!byHabit.has(c.habitId)) byHabit.set(c.habitId, []);
    byHabit.get(c.habitId)!.push(c);
  }

  let total = FIRST_CHECKOFF_BONUS; // identity moment: "I started"
  for (const habitCheckoffs of byHabit.values()) {
    total += computeHabitXP(habitCheckoffs);
  }

  return total;
}
