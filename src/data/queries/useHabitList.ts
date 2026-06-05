import { useHabits } from './useHabits';

export function useHabitList() {
  const { data, isLoading, error } = useHabits();
  const active   = (data ?? []).filter((h) => h.isActive);
  const archived = (data ?? []).filter((h) => !h.isActive);
  return { active, archived, isLoading, error };
}
