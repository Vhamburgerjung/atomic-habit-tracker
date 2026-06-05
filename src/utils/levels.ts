export type Level = {
  level: number;
  title: string;
  minXP: number;
  maxXP: number | null;
};

const BASE_LEVELS: Omit<Level, 'maxXP'>[] = [
  { level: 1, title: 'Beginner',    minXP: 0 },
  { level: 2, title: 'Consistent',  minXP: 200 },
  { level: 3, title: 'Dedicated',   minXP: 600 },
  { level: 4, title: 'Established', minXP: 1500 },
  { level: 5, title: 'Expert',      minXP: 3500 },
  { level: 6, title: 'Master',      minXP: 7500 },
];

export const LEVELS: Level[] = BASE_LEVELS.map((l, i, arr) => ({
  ...l,
  maxXP: arr[i + 1]?.minXP ?? null,
}));

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      if (LEVELS[i].maxXP === null) {
        const prestige = Math.floor((xp - LEVELS[i].minXP) / 5000);
        if (prestige > 0) {
          return {
            level: LEVELS[i].level + prestige,
            title: 'Legend',
            minXP: LEVELS[i].minXP + prestige * 5000,
            maxXP: LEVELS[i].minXP + (prestige + 1) * 5000,
          };
        }
      }
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  if (current.maxXP === null) return 1;
  const range = current.maxXP - current.minXP;
  return Math.min((xp - current.minXP) / range, 1);
}
