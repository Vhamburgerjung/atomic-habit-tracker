import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toCheckOff, toHabit } from '../../lib/mappers';
import { evaluateBadges } from '../../utils/badges';

export function useUserBadges() {
  return useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const [checkoffsRes, habitsRes] = await Promise.all([
        supabase.from('checkoffs').select('*').order('completed_at', { ascending: true }),
        supabase.from('habits').select('*'),
      ]);
      if (checkoffsRes.error) throw checkoffsRes.error;
      if (habitsRes.error) throw habitsRes.error;

      const checkoffs = (checkoffsRes.data ?? []).map(toCheckOff);
      const habits = (habitsRes.data ?? []).map(toHabit);

      return evaluateBadges(checkoffs, habits);
    },
    staleTime: 30_000,
  });
}
