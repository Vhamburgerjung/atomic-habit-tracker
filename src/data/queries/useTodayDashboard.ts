import { useHabits } from './useHabits';
import { useRecentCheckOffs } from './useCheckOffs';
import { getEffectiveStreak, isStreakFrozen, getRecentCheckoffs } from '../../utils/streaks';
import type { Habit, CheckOff } from '../../store/useHabitStore';

export type TodayHabitItem = Habit & {
  isCompletedToday: boolean;
  currentStreak: number;
  isStreakFrozen: boolean;
  recentDays: boolean[];
  todayCheckOffId: string | null;
};

export function useTodayDashboard() {
  const habitsQuery   = useHabits({ isActive: true });
  const checkoffQuery = useRecentCheckOffs(112);

  const isLoading = habitsQuery.isLoading || checkoffQuery.isLoading;
  const error     = habitsQuery.error ?? checkoffQuery.error;
  const habits          = habitsQuery.data  ?? [];
  const recentCheckoffs = checkoffQuery.data ?? [];

  const items: TodayHabitItem[] = habits
    .map((habit) => {
      const todayPrefix = new Date().toISOString().split('T')[0];
      const todayCheckOff = recentCheckoffs.find(
        (c: CheckOff) => c.habitId === habit.id && c.completedAt.startsWith(todayPrefix)
      );
      return {
        ...habit,
        isCompletedToday: !!todayCheckOff,
        currentStreak:    getEffectiveStreak(habit.id, recentCheckoffs),
        isStreakFrozen:   isStreakFrozen(habit.id, recentCheckoffs),
        recentDays:       getRecentCheckoffs(habit.id, recentCheckoffs, 112),
        todayCheckOffId:  todayCheckOff?.id ?? null,
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const completionRate = habits.length > 0
    ? items.filter((i) => i.isCompletedToday).length / habits.length
    : 0;

  return { items, completionRate, isLoading, error };
}
