import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toHabit } from '../../lib/mappers';
import type { Habit } from '../../store/useHabitStore';

type HabitFilter = {
  isActive?: boolean;
  category?: Habit['category'];
};

export function useHabits(filter?: HabitFilter) {
  return useQuery({
    queryKey: ['habits', filter],
    queryFn: async () => {
      let q = supabase.from('habits').select('*').order('created_at', { ascending: true });
      if (filter?.isActive !== undefined) q = q.eq('is_active', filter.isActive);
      if (filter?.category)               q = q.eq('category', filter.category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(toHabit);
    },
  });
}
