import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useHabitRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`habit-realtime-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        qc.invalidateQueries({ queryKey: ['habits'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkoffs' }, () => {
        const today = new Date().toISOString().split('T')[0];
        qc.invalidateQueries({ queryKey: ['checkoffs', 'today', today] });
        qc.invalidateQueries({ queryKey: ['habitStats'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
}
