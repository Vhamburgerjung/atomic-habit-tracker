# 014 — `WeekdayHeader` + `HabitWeekRow` + 7-day list mode

**Type:** AFK
**Status:** ready

## What to build

A 7-day list view: rows = habits, columns = the last 7 days, each cell a tappable colored square. Sticky weekday header pinned under the top app bar.

**New component:** `src/components/WeekdayHeader.tsx`

- Sticky `position: "absolute"` directly below the existing top app bar (mirror the pattern used for the app bar itself in `app/(tabs)/index.tsx`)
- 7 weekday-initial labels, ordered chronologically (oldest left → today right). Header rotates with the current weekday — e.g. if today is Saturday: `So Mo Di Mi Do Fr Sa`
- Today's column (rightmost) accentuated: bolder text and/or accent color
- Background matches `COLORS.background`, bottom border `COLORS.border`
- Uses the same square-cell widths/gap as `HabitWeekRow` so columns line up

**New component:** `src/components/HabitWeekRow.tsx`

**Layout:**
- Left: small icon-box + name (`numberOfLines={1}`), takes remaining width after the squares are reserved
- Right: 7 fixed-size colored squares (32–36px each, 6px gap)
  - Completed day: habit color, opacity 1.0
  - Open day (post-creation, not completed): habit color, opacity ~0.08
  - Day before `createdAt`: neutral grey (`COLORS.border`), NOT tappable
- Squares ordered chronologically left → right, today is the rightmost square

**Interaction:**
- Tap on a square → toggle that specific date via `useHabitToggle` (slice 012). All 7 days are tappable except pre-`createdAt` ones.
- Past-day toggles fire haptic + dispatch but do NOT trigger XPToast (already handled by the hook — slice 012)
- Toggling today (rightmost square) triggers XPToast as usual
- Tap on the left part (icon + name) → `router.push('/habit/' + id)` for detail

**Integration in `app/(tabs)/index.tsx`:**
- When `viewMode === "week"`: render sticky `WeekdayHeader` (fixed below top app bar) + a `ScrollView` of `HabitWeekRow`s with appropriate `paddingTop` to clear both the app bar and the header
- Otherwise unchanged

## Acceptance criteria

- [ ] `WeekdayHeader` sticky below the top app bar with 7 weekday initials, today rightmost, today's label accentuated
- [ ] `HabitWeekRow` shows icon + name + 7 squares per habit
- [ ] Square colors: full habit color when done, dim when open, neutral grey when pre-creation
- [ ] Pre-creation squares are not tappable (no toggle, no haptic)
- [ ] Tapping any post-creation square toggles that date's check-off and persists
- [ ] XPToast appears only when toggling today; past-day toggles are silent
- [ ] Tapping the row's icon/name area opens the detail screen
- [ ] Header columns visually align with row squares
- [ ] Switching modes via the pill swaps cleanly between full / compact / week
- [ ] No regression in full or compact views

## Blocked by

- 011 (ViewModeSwitcher visible & wired)
- 012 (`useHabitToggle` hook)
