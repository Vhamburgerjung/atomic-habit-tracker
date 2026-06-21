import type { CheckOff, Habit } from '../store/useHabitStore';
import { getBestStreak, isStreakFrozen } from './streaks';

export type BadgeId =
  | 'first-step'
  | 'on-fire'
  | 'week-one'
  | 'never-miss-twice'
  | 'month-strong'
  | 'centurion'
  | 'habit-architect'
  | 'wizard'
  | 'frozen-but-not-broken';

export type Badge = {
  id: BadgeId;
  emoji: string;
  name: string;
  identityMessage: string;
  earned: boolean;
};

const BADGE_SPECS: Omit<Badge, 'earned'>[] = [
  {
    id: 'first-step',
    emoji: '🌱',
    name: 'First Step',
    identityMessage: "You're becoming someone who starts.",
  },
  {
    id: 'on-fire',
    emoji: '🔥',
    name: 'On Fire',
    identityMessage: "You're becoming someone who shows up every day.",
  },
  {
    id: 'week-one',
    emoji: '📅',
    name: 'Week One',
    identityMessage: "You're becoming someone who keeps coming back.",
  },
  {
    id: 'never-miss-twice',
    emoji: '💎',
    name: 'Never Miss Twice',
    identityMessage: "You're becoming someone who bounces back.",
  },
  {
    id: 'month-strong',
    emoji: '🗓️',
    name: 'Month Strong',
    identityMessage: "You're becoming someone whose habits are automatic.",
  },
  {
    id: 'centurion',
    emoji: '🏆',
    name: 'Centurion',
    identityMessage: "You're becoming someone who follows through — 100 times over.",
  },
  {
    id: 'habit-architect',
    emoji: '🧱',
    name: 'Habit Architect',
    identityMessage: "You're designing the life you want.",
  },
  {
    id: 'wizard',
    emoji: '📖',
    name: 'Wizard',
    identityMessage: "You understand your own habits at a deeper level.",
  },
  {
    id: 'frozen-but-not-broken',
    emoji: '🧊',
    name: 'Frozen But Not Broken',
    identityMessage: "You missed once — and you came back. That's who you are.",
  },
];

function hasNeverMissTwice(checkoffs: CheckOff[]): boolean {
  const byHabit = new Map<string, string[]>();
  for (const c of checkoffs) {
    if (!byHabit.has(c.habitId)) byHabit.set(c.habitId, []);
    byHabit.get(c.habitId)!.push(c.completedAt);
  }

  for (const completions of byHabit.values()) {
    const days = [
      ...new Set(completions.map((d) => new Date(d).toDateString())),
    ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (let i = 0; i + 1 < days.length; i++) {
      const diff = Math.round(
        (new Date(days[i + 1]).getTime() - new Date(days[i]).getTime()) / 86_400_000
      );
      // diff === 2 means exactly 1 day was skipped then they came back
      if (diff === 2) return true;
    }
  }
  return false;
}

function appUsedDays(checkoffs: CheckOff[]): number {
  return new Set(checkoffs.map((c) => new Date(c.completedAt).toDateString())).size;
}

export function evaluateBadges(checkoffs: CheckOff[], habits: Habit[]): Badge[] {
  const totalCheckoffs = checkoffs.length;
  const totalHabits = habits.length;

  const bestStreakAny = habits.reduce(
    (max, h) => Math.max(max, getBestStreak(h.id, checkoffs)),
    0
  );

  const hasWizardHabit = habits.some(
    (h) => h.cue.trim() && h.craving?.trim() && h.response?.trim() && h.reward?.trim()
  );

  const anyHabitFrozen = habits.some((h) => isStreakFrozen(h.id, checkoffs));

  const earnedSet = new Set<BadgeId>([
    ...(totalCheckoffs >= 1 ? (['first-step'] as BadgeId[]) : []),
    ...(bestStreakAny >= 7 ? (['on-fire'] as BadgeId[]) : []),
    ...(appUsedDays(checkoffs) >= 7 ? (['week-one'] as BadgeId[]) : []),
    ...(hasNeverMissTwice(checkoffs) ? (['never-miss-twice'] as BadgeId[]) : []),
    ...(bestStreakAny >= 30 ? (['month-strong'] as BadgeId[]) : []),
    ...(totalCheckoffs >= 100 ? (['centurion'] as BadgeId[]) : []),
    ...(totalHabits >= 3 ? (['habit-architect'] as BadgeId[]) : []),
    ...(hasWizardHabit ? (['wizard'] as BadgeId[]) : []),
    ...(anyHabitFrozen ? (['frozen-but-not-broken'] as BadgeId[]) : []),
  ]);

  return BADGE_SPECS.map((spec) => ({ ...spec, earned: earnedSet.has(spec.id) }));
}
