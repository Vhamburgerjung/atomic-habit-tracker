# 013 — `HabitCardCompact` + 2-column grid mode

**Type:** AFK
**Status:** ready

## What to build

A new compact card (~half-width) rendered in a 2-column grid when `viewMode === "compact"`. HabitKit-inspired calendar feel.

**New component:** `src/components/HabitCardCompact.tsx`

**Layout (top to bottom):**
1. **Header row**: small icon-box (32×32 or 36×36) + name (single line, `numberOfLines={1}`). No CheckButton — the whole card is the tap target.
2. **Heatmap**: 7 rows × 11 columns = 77 cells, GitHub-style.
   - Rows = weekdays, Mon top → Sun bottom
   - Columns = weeks, oldest left → current week right
   - "Today" is in the rightmost column at the current weekday's row
   - Cells before `habit.createdAt` rendered in neutral grey (same `COLORS.border` treatment as the full card)
   - Completed cells: full habit color, opacity 1.0
   - Not completed (post-creation): habit color, opacity ~0.08

**Interaction:**
- Tap on card → toggle today via `useHabitToggle` (slice 012). Border pulse animation (same `borderProgress` pattern as `HabitCard.tsx`) + today's heatmap cell animates from dim to full color.
- Long-press on card → `router.push('/habit/' + id)` for detail view.
- Heatmap cells themselves are inert (no per-cell taps).
- XPToast triggered via the hook's `onChecked` callback, surfaced at the Today screen.

**Integration in `app/(tabs)/index.tsx`:**
- When `viewMode === "compact"`: render `<View>` with `flexDirection: "row"`, `flexWrap: "wrap"`, `gap: 12`. Each `HabitCardCompact` gets `width: "48%"` (or computed half-width minus gap).
- When `viewMode === "full"`: unchanged.
- `viewMode === "week"` lands in slice 014.

## Acceptance criteria

- [ ] `HabitCardCompact` renders icon-box + name + 7×11 heatmap
- [ ] Heatmap orientation: rows = weekdays (Mon → Sun), columns = weeks, today bottom-right (current weekday row, last column)
- [ ] Cells before `createdAt` are neutral grey
- [ ] Completed cells full color, missed cells dim
- [ ] Tap on card toggles today (haptic + border pulse + today cell fills + XPToast)
- [ ] Long-press opens the habit detail screen
- [ ] Today screen renders 2-column grid when `viewMode === "compact"`
- [ ] Switching back to `"full"` restores the existing layout
- [ ] No regression in full view

## Blocked by

- 011 (ViewModeSwitcher visible & wired)
- 012 (`useHabitToggle` hook)
