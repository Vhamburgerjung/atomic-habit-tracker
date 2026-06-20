# 011 — `ViewModeSwitcher` floating pill

**Type:** AFK
**Status:** ready

## What to build

A narrow, centered floating segmented control at the bottom of the Today screen that lets the user switch between the three dashboard view modes.

**New component:** `src/components/ViewModeSwitcher.tsx`

- Three icon buttons from `lucide-react-native`: `Rows3` (full), `LayoutGrid` (compact), `CalendarDays` (week)
- Active mode icon in `COLORS.accent`, inactive in `COLORS.textMuted`
- Pill background: semi-transparent `COLORS.card` with 1px `COLORS.border`, `borderRadius: 999`
- Horizontal padding ~14pt per icon, gap ~6pt — total width ≈ 140pt (NOT full-width)
- Subtle drop-shadow / elevation so it lifts off the scroll content
- No labels, no auto-hide, no animations beyond icon color change

**Integration in `app/(tabs)/index.tsx`:**
- `position: "absolute"`, horizontally centered, `bottom: insets.bottom + TAB_BAR_HEIGHT + 12`
- `TAB_BAR_HEIGHT` taken from the existing tab-bar config (read `app/(tabs)/_layout.tsx` for the value)
- Always visible while on the Today screen, regardless of scroll position
- Tap calls `setViewMode(...)` from `useViewMode()`
- Today screen STILL renders only the existing `HabitCard` full layout — switching modes only changes the persisted state; the visual switch lands in slices 013 / 014
- Remove the temporary debug label added in slice 010

## Acceptance criteria

- [ ] Pill renders centered at the bottom, above the bottom tab bar
- [ ] Pill width is content-sized (not screen-wide)
- [ ] Three icons present in the documented order: full / compact / week
- [ ] Active icon highlighted in accent color, inactive in muted
- [ ] Tapping an icon updates `viewMode` and persists via slice 010 hook
- [ ] Pill stays fixed while the habit list scrolls
- [ ] Slice 010 debug label removed

## Blocked by

- 010 (`useViewMode` hook)
