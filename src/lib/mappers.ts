import type { Habit, CheckOff } from '../store/useHabitStore';

export type DbHabit = {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  identity_statement: string | null;
  two_minute_version: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  target_days_per_week: number | null;
  reminder_time: string | null;
  category: 'health' | 'learning' | 'mindfulness' | 'social' | 'other';
  is_active: boolean;
  created_at: string;
};

export type DbCheckOff = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  note: string | null;
};

export function toHabit(row: DbHabit): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    emoji: row.emoji ?? undefined,
    color: row.color ?? undefined,
    cue: row.cue,
    craving: row.craving,
    response: row.response,
    reward: row.reward,
    identityStatement: row.identity_statement ?? undefined,
    twoMinuteVersion: row.two_minute_version ?? undefined,
    frequency: row.frequency,
    targetDaysPerWeek: row.target_days_per_week ?? undefined,
    reminderTime: row.reminder_time ?? undefined,
    category: row.category,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function toCheckOff(row: DbCheckOff): CheckOff {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    completedAt: row.completed_at,
    note: row.note ?? undefined,
  };
}
