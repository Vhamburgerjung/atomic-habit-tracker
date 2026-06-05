import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toCheckOff } from '../../lib/mappers';
import { getStreak, getBestStreak } from '../../utils/streaks';
import type { CheckOff } from '../../store/useHabitStore';

type DateRange = { from: string; to: string };

export function useHabitStats(habitId: string, range: DateRange) {
  return useQuery({
    queryKey: ['habitStats', habitId, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkoffs')
        .select('*')
        .eq('habit_id', habitId)
        .gte('completed_at', `${range.from}T00:00:00.000Z`)
        .lte('completed_at', `${range.to}T23:59:59.999Z`)
        .order('completed_at', { ascending: true });
      if (error) throw error;
      const checkoffs: CheckOff[] = (data ?? []).map(toCheckOff);

      const completionByDay: Record<string, boolean> = {};
      for (const c of checkoffs) {
        completionByDay[c.completedAt.split('T')[0]] = true;
      }

      return {
        checkoffs,
        completionByDay,
        streak: {
          current: getStreak(habitId, checkoffs),
          record:  getBestStreak(habitId, checkoffs),
        },
        totalCheckOffs: checkoffs.length,
      };
    },
    enabled: !!habitId,
  });
}
