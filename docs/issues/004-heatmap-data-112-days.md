# 004 — Heatmap-Daten: 112 Tage statt 30

**Type:** AFK
**Status:** ready

## What to build

Expand the data layer so `useTodayDashboard` returns 112 days of check-off history per habit (currently 30). This feeds the new heatmap in the redesigned `HabitCard`.

Changes:
- `useRecentCheckOffs(30)` → `useRecentCheckOffs(112)`
- `getRecentCheckoffs(habit.id, recentCheckoffs, 30)` → `(..., 112)`
- `TodayHabitItem.recentDays` type stays `boolean[]` but length is 112
- Index 0 = oldest day, index 111 = today (consumer renders bottom-right = today)

The card itself derives "pre-creation" days by comparing each day's date to `habit.createdAt` — no need to add a new field; the card has both `recentDays` and `createdAt` and can compute the 3-state visual (done / missed / pre-creation).

Verify no perf regression: 112 booleans × N habits is still trivial.

## Acceptance criteria

- [ ] `useRecentCheckOffs` fetches 112 days
- [ ] `getRecentCheckoffs` returns array of length 112
- [ ] `recentDays` in `TodayHabitItem` is 112 booleans
- [ ] Index ordering: `[0]` = 111 days ago, `[111]` = today
- [ ] No regression in `isCompletedToday`, `currentStreak`, `isStreakFrozen` computations

## Blocked by

None — can start immediately, parallel to 001 and 002.
