import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toCheckOff } from '../../lib/mappers';

type DateRange = { from: string; to: string };

export function useCheckOffs(habitId: string, range?: DateRange) {
  return useQuery({
    queryKey: ['checkoffs', habitId, range],
    queryFn: async () => {
      let q = supabase
        .from('checkoffs')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false });
      if (range) {
        q = q
          .gte('completed_at', `${range.from}T00:00:00.000Z`)
          .lte('completed_at', `${range.to}T23:59:59.999Z`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(toCheckOff);
    },
    enabled: !!habitId,
  });
}

export function useRecentCheckOffs(days: number) {
  const from = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().split('T')[0];
  return useQuery({
    queryKey: ['checkoffs', 'recent', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkoffs')
        .select('*')
        .gte('completed_at', `${from}T00:00:00.000Z`)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toCheckOff);
    },
  });
}

export function useTodayCheckOffs() {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['checkoffs', 'today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkoffs')
        .select('*')
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lte('completed_at', `${today}T23:59:59.999Z`);
      if (error) throw error;
      return (data ?? []).map(toCheckOff);
    },
  });
}
