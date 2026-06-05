import type { Habit, CheckOff } from '../store/useHabitStore';

export type HabitCommand =
  | {
      type: 'CREATE_HABIT';
      payload: Omit<Habit, 'id' | 'userId' | 'createdAt'>;
    }
  | {
      type: 'UPDATE_HABIT';
      payload: { id: string } & Partial<Omit<Habit, 'id' | 'userId' | 'createdAt'>>;
    }
  | {
      type: 'ARCHIVE_HABIT';
      payload: { id: string };
    }
  | {
      type: 'TOGGLE_CHECKOFF';
      payload: { habitId: string; date: string; note?: string };
    };

export type CommandResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export type HabitEvent =
  | { event: 'HABIT_CREATED';    habit: Habit }
  | { event: 'HABIT_UPDATED';    habit: Habit }
  | { event: 'HABIT_ARCHIVED';   habitId: string }
  | { event: 'CHECKOFF_ADDED';   checkOff: CheckOff }
  | { event: 'CHECKOFF_REMOVED'; habitId: string; date: string };
