import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Habit = {
  id: string;
  name: string;
  emoji: string;
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
  completedAt: string;
};

type HabitStore = {
  habits: Habit[];
  checkoffs: CheckOff[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => string;
  toggleCheckOff: (habitId: string) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>) => void;
};

// Fake data for UI preview — remove once real user data flows in
function makeFakeData(): { habits: Habit[]; checkoffs: CheckOff[] } {
  const today = new Date();
  const dayMs = 86400000;

  const habits: Habit[] = [
    {
      id: "demo-1",
      name: "Morning Meditation",
      emoji: "🧘",
      cue: "After waking up",
      craving: "I want to feel calm",
      response: "Meditate for 10 minutes",
      reward: "Make a good coffee afterwards",
      identityStatement: "I am someone who starts the day with clarity",
      frequency: "daily",
      category: "mindfulness",
      createdAt: new Date(today.getTime() - 30 * dayMs).toISOString(),
      isActive: true,
    },
    {
      id: "demo-2",
      name: "Read 20 Pages",
      emoji: "📚",
      cue: "After lunch",
      craving: "I want to learn something new",
      response: "Read for 25 minutes",
      reward: "Short walk after",
      frequency: "daily",
      category: "learning",
      createdAt: new Date(today.getTime() - 25 * dayMs).toISOString(),
      isActive: true,
    },
    {
      id: "demo-3",
      name: "Evening Run",
      emoji: "🏃",
      cue: "After work",
      craving: "I want more energy",
      response: "Run 5 km",
      reward: "Listen to a podcast",
      identityStatement: "I am someone who moves every day",
      frequency: "daily",
      category: "health",
      createdAt: new Date(today.getTime() - 20 * dayMs).toISOString(),
      isActive: true,
    },
    {
      id: "demo-4",
      name: "Journaling",
      emoji: "✍️",
      cue: "Before bed",
      craving: "I want to reflect on my day",
      response: "Write 3 things I am grateful for",
      reward: "Feel at peace before sleeping",
      frequency: "daily",
      category: "mindfulness",
      createdAt: new Date(today.getTime() - 15 * dayMs).toISOString(),
      isActive: true,
    },
    {
      id: "demo-5",
      name: "No Sugar",
      emoji: "🍎",
      cue: "Every meal",
      craving: "I want to feel healthier",
      response: "Skip dessert and sugary drinks",
      reward: "Track the streak",
      frequency: "daily",
      category: "health",
      createdAt: new Date(today.getTime() - 10 * dayMs).toISOString(),
      isActive: true,
    },
    {
      id: "demo-6",
      name: "Spanish Lesson",
      emoji: "🇪🇸",
      cue: "After breakfast",
      craving: "I want to speak a new language",
      response: "10 minutes on Duolingo",
      reward: "Mark my streak",
      frequency: "daily",
      category: "learning",
      createdAt: new Date(today.getTime() - 8 * dayMs).toISOString(),
      isActive: true,
    },
  ];

  const checkoffs: CheckOff[] = [];
  let idCounter = 1;

  // Helper: add a checkoff N days ago
  const addCheckoff = (habitId: string, daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8, 0, 0, 0);
    checkoffs.push({ id: `demo-co-${idCounter++}`, habitId, completedAt: date.toISOString() });
  };

  // demo-1: 14 day streak, completed today
  for (let i = 0; i <= 14; i++) addCheckoff("demo-1", i);

  // demo-2: 7 day streak, completed today
  for (let i = 0; i <= 7; i++) addCheckoff("demo-2", i);

  // demo-3: 5 day streak, NOT completed today
  for (let i = 1; i <= 5; i++) addCheckoff("demo-3", i);

  // demo-4: completed today only
  addCheckoff("demo-4", 0);
  addCheckoff("demo-4", 1);
  addCheckoff("demo-4", 2);

  // demo-5: NOT completed today, 3 day streak
  addCheckoff("demo-5", 1);
  addCheckoff("demo-5", 2);
  addCheckoff("demo-5", 3);

  // demo-6: NOT completed today, 1 day streak
  addCheckoff("demo-6", 1);

  return { habits, checkoffs };
}

const { habits: fakeHabits, checkoffs: fakeCheckoffs } = makeFakeData();

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: fakeHabits,
      checkoffs: fakeCheckoffs,

      addHabit: (habitData) => {
        const id = Date.now().toString();
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habitData,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      toggleCheckOff: (habitId) =>
        set((state) => {
          const today = new Date().toDateString();
          const existing = state.checkoffs.find(
            (c) =>
              c.habitId === habitId &&
              new Date(c.completedAt).toDateString() === today
          );
          if (existing) {
            return {
              checkoffs: state.checkoffs.filter((c) => c.id !== existing.id),
            };
          }
          return {
            checkoffs: [
              ...state.checkoffs,
              {
                id: Date.now().toString(),
                habitId,
                completedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          checkoffs: state.checkoffs.filter((c) => c.habitId !== id),
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
    }),
    {
      name: "habit-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
