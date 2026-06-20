# 015 — `recentDays` extended to 365 days

**Type:** AFK
**Status:** ready

## What to build

Extend the dashboard data layer so each habit's `recentDays` covers the last 365 days instead of the current 112. This unlocks the year-long heatmap (slice 016) and the calendar month view (slice 017).

**Data layer:**
- `useRecentCheckOffs` (whichever query feeds `useTodayDashboard`) requests 365 days of history.
- `TodayHabitItem.recentDays` is now `boolean[]` of length 365 with `recentDays[length - 1]` = today.

**Consumer updates (no visual change in this slice):**
- `HabitCard`, `HabitCardCompact`, `HabitWeekRow` all currently assume `recentDays[111]` is today (a hardcoded offset from the old 112-day window). Replace every such reference with a length-derived index so the components keep showing the same content with the longer array.
- The existing 4×28 Full heatmap continues to render its 112 most recent days — slice 016 replaces the layout itself.
- The existing 7×11 Compact heatmap and the 7-day list rows continue to render the same days they show today.

## Acceptance criteria

- [ ] `useTodayDashboard` returns `recentDays` of length 365
- [ ] Full Card, Compact Card, and 7-day List visually unchanged from before this slice
- [ ] No hardcoded `111` or `112` left in components that index into `recentDays`
- [ ] App boots and the three view modes render without runtime errors

## Blocked by

None — can start immediately.
