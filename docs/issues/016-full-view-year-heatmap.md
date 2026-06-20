# 016 — Full-View: 7×52 horizontal-scrollable year heatmap

**Type:** AFK
**Status:** ready

## What to build

Replace the Full HabitCard's 4×28 heatmap with a 7×52 GitHub-style year heatmap. Cells have fixed pixel size and the heatmap scrolls horizontally so the user can pan through a whole year.

**Heatmap layout:**
- 7 rows × 52 columns = 364 cells.
- Rows = weekdays, Monday on top, Sunday on bottom.
- Columns = ISO weeks, oldest week on the left, current week on the right.
- "Today" sits in the rightmost column at the row matching today's weekday.
- Cells in the current column below today (later weekdays this week) and cells in column 0 above the leftmost rendered date are rendered like any other "post-creation, not completed" cell — they're not special-cased as "future" since the new color rule covers them.

**Cell sizing + scroll:**
- Fixed cell size 12×12 with 3px gap. Total content width ≈ 777px.
- Heatmap is a horizontal `ScrollView`, bleed-to-edge inside the card (no horizontal padding on the ScrollView itself; `contentContainerStyle` provides a 12px lead on both sides so the first and last weeks aren't flush against the card border).
- On mount, the heatmap is scrolled all the way to the right so today's column is visible. Use `contentOffset` or an `onContentSizeChange` → `scrollToEnd({ animated: false })` pattern.

**Color rule (also adopted by slice 017):**
- Completed cell: full habit color, opacity 1.
- Not completed but in an "active week" (the column has at least one completed cell): habit color, opacity 0.2.
- Else (baseline — includes pre-creation, cells outside `recentDays`, post-creation not completed in an inactive week): habit color, opacity 0.08.
- Today's cell gets a small accent-colored dot rendered inside it (≈4×4 circle, centered, `COLORS.accent`). The dot sits on top of whatever color/opacity the cell already has.

**Interactions:**
- The whole card is a `Pressable` with `onLongPress={() => router.push('/habit/' + id)}`. No `onPress` on the card (or it's a no-op) — short taps must NOT open the detail screen, because horizontal swipes inside the heatmap would race with a tap handler.
- The `CheckButton` in the header keeps its own onPress for today-toggle.
- Heatmap cells themselves are inert (no per-cell taps).

**Shared helper:**
- Extract the "active week" computation (given a list of date strings or indices in a column, return whether any maps to a `recentDays` true) into a small utility module so slice 017 can reuse it.

## Acceptance criteria

- [ ] Full HabitCard shows a 7×52 heatmap with 12×12 cells and 3px gaps
- [ ] Rows are weekdays Mon→Sun, columns are weeks oldest→newest
- [ ] Heatmap scrolls horizontally inside the card; today's column is visible on first render
- [ ] Today's cell shows an accent dot
- [ ] Color rule: done = full; in active week = 0.2; baseline = 0.08
- [ ] Card opens detail screen on long-press, not short tap
- [ ] CheckButton still toggles today with haptic + XPToast (via the existing `useHabitToggle` flow)
- [ ] No visual regression for the icon-box + name header row

## Blocked by

- 015 (`recentDays` covers 365 days)
