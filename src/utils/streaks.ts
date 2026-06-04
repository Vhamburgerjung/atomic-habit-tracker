import { CheckOff } from "../store/useHabitStore";

export function isCompletedToday(habitId: string, checkoffs: CheckOff[]): boolean {
  const today = new Date().toDateString();
  return checkoffs.some(
    (c) => c.habitId === habitId && new Date(c.completedAt).toDateString() === today
  );
}

export function getStreak(habitId: string, checkoffs: CheckOff[]): number {
  const uniqueDays = new Set(
    checkoffs
      .filter((c) => c.habitId === habitId)
      .map((c) => new Date(c.completedAt).toDateString())
  );

  const date = new Date();
  if (!uniqueDays.has(date.toDateString())) {
    date.setDate(date.getDate() - 1);
  }

  let streak = 0;
  while (uniqueDays.has(date.toDateString())) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export function getBestStreak(habitId: string, checkoffs: CheckOff[]): number {
  const uniqueDays = [
    ...new Set(
      checkoffs
        .filter((c) => c.habitId === habitId)
        .map((c) => new Date(c.completedAt).toDateString())
    ),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (uniqueDays.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

export function getWeeklyCompletions(habitId: string, checkoffs: CheckOff[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  return checkoffs.filter(
    (c) => c.habitId === habitId && new Date(c.completedAt) >= weekAgo
  ).length;
}

export function getRecentCheckoffs(
  habitId: string,
  checkoffs: CheckOff[],
  days = 30
): boolean[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return checkoffs.some(
      (c) =>
        c.habitId === habitId &&
        new Date(c.completedAt).toDateString() === date.toDateString()
    );
  });
}

export function getYearData(
  habitId: string,
  checkoffs: CheckOff[]
): { date: string; completed: boolean }[] {
  return Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      date: date.toISOString().split("T")[0],
      completed: checkoffs.some(
        (c) =>
          c.habitId === habitId &&
          new Date(c.completedAt).toDateString() === date.toDateString()
      ),
    };
  });
}
