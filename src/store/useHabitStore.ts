export type Habit = {
  id: string;
  userId: string;
  name: string;
  emoji?: string;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  identityStatement?: string;
  twoMinuteVersion?: string;
  frequency: "daily" | "weekly" | "custom";
  targetDaysPerWeek?: number;
  reminderTime?: string;
  notificationId?: string;
  category: "health" | "learning" | "mindfulness" | "social" | "other";
  createdAt: string;
  isActive: boolean;
};

export type CheckOff = {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  note?: string;
};
