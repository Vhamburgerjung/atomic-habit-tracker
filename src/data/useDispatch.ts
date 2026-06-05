import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatch } from './dispatch';
import type { HabitCommand } from './types';

export function useDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (command: HabitCommand) => dispatch(command),
    onSuccess: (_result, command) => {
      if (
        command.type === 'CREATE_HABIT' ||
        command.type === 'UPDATE_HABIT'  ||
        command.type === 'ARCHIVE_HABIT'
      ) {
        qc.invalidateQueries({ queryKey: ['habits'] });
      }
      if (command.type === 'TOGGLE_CHECKOFF') {
        const today = new Date().toISOString().split('T')[0];
        qc.invalidateQueries({ queryKey: ['checkoffs', 'today', today] });
        qc.invalidateQueries({ queryKey: ['checkoffs', 'recent'] });
        qc.invalidateQueries({ queryKey: ['habitStats', command.payload.habitId] });
        qc.invalidateQueries({ queryKey: ['user-xp'] });
        qc.invalidateQueries({ queryKey: ['user-badges'] });
      }
    },
  });
}
