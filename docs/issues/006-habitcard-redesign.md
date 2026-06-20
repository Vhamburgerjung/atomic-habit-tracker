# 006 — HabitCard-Redesign: Icon-Box, Name, Heatmap

**Type:** AFK
**Status:** ready

## What to build

Complete visual rewrite of `src/components/HabitCard.tsx` to match the new Mockup style.

**New layout (top to bottom):**
1. **Header row**: Icon-Box (40×40, rounded, habit color at ~20% opacity bg + matching border, emoji centered inside) + Name (single line, no truncation styling fancier than `numberOfLines={1}`) + CheckButton (right edge)
2. **Heatmap**: 28 columns × 4 rows = 112 cells. Cell at row 3, col 27 (bottom-right) = today. Cell at row 0, col 0 (top-left) = 111 days ago.

**Heatmap cell states (binary):**
- Pre-creation day (day < `habit.createdAt`): neutral grey (`COLORS.border` or similar)
- Completed: full habit color, opacity 1.0
- Not completed (but post-creation): habit color at ~0.08 opacity

**Removed entirely from the card** (no longer rendered):
- Streak count + emoji
- Freeze indicator
- Identity statement
- Cue / Craving / Response / Reward rows
- Old 30-day dot grid

**Color resolution:**
- `const renderColor = habit.color ?? '#7C3AED';`

**Interaction:**
- Card body Pressable → `router.push('/habit/' + id)` (unchanged)
- Heatmap cells are NOT tappable
- CheckButton uses `accentColor={renderColor}` (depends on 005)

**Props change:** drop `identityStatement`, `cue`, `craving`, `response`, `reward`, `streak`, `isStreakFrozen` from `HabitCardProps`. Add `color?: string`. Keep `recentDays: boolean[]` (now length 112), `createdAt: string`, `emoji`, `name`, `id`, `isCompletedToday`, `onToggle`, `onChecked`.

Update the caller `app/(tabs)/index.tsx` to pass the new prop set (clean up the dropped props at the call site).

## Acceptance criteria

- [ ] Card renders Icon-Box + Name + CheckButton + 112-cell heatmap
- [ ] Heatmap orientation: today bottom-right, oldest top-left
- [ ] Pre-creation cells rendered in neutral grey (not "missed")
- [ ] Completed cells = full habit color; missed = faint habit color
- [ ] Streak / freeze / identity / 4-laws no longer rendered
- [ ] `color` prop drives icon-box bg + border + heatmap cells + CheckButton tint
- [ ] Card body still navigates to detail screen on tap
- [ ] Heatmap cells are inert (no tap handlers)
- [ ] `HabitCardProps` shape cleaned up (dropped props removed)

## Blocked by

- 001 (color column)
- 004 (112-day data)
- 005 (CheckButton color prop)
