import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toCheckOff } from '../../lib/mappers';
import { computeTotalXP } from '../../utils/xp';
import { getLevel, getLevelProgress } from '../../utils/levels';

export function useUserXP() {
  return useQuery({
    queryKey: ['user-xp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkoffs')
        .select('*')
        .order('completed_at', { ascending: true });
      if (error) throw error;

      const checkoffs = (data ?? []).map(toCheckOff);
      const totalXP = computeTotalXP(checkoffs);
      const level = getLevel(totalXP);
      const progress = getLevelProgress(totalXP);

      return { totalXP, level, progress };
    },
    staleTime: 30_000,
  });
}
