# 002 — ColorPicker-Komponente mit 25-Farben-Palette

**Type:** AFK
**Status:** ready

## What to build

Standalone, reusable `ColorPicker.tsx` component in `src/components/`. Displays a curated palette of 25 colors in a 4-column grid (~7 rows). Each swatch is a tappable circle/rounded-square showing the color. The currently selected color gets a clear visual indicator (border ring or check overlay). Tapping a swatch fires an `onChange(hex: string)` callback.

The palette should be a constant exported from a shared file (e.g. `src/theme/habitColors.ts`) so other screens can reuse it. Pick 25 colors that are pleasant and attention-grabbing on a dark background — mix of warm + cool + saturated + muted accents. Include the four mockup colors (`#7C3AED`, `#EE9800`, `#10B981`, `#3B82F6`) as part of the set.

## Acceptance criteria

- [ ] `ColorPicker` component renders 25 swatches in a 4-column grid
- [ ] Selected swatch is visually distinct from unselected
- [ ] Tapping a swatch calls `onChange` with the hex string
- [ ] Palette exported as a named constant from a shared theme file
- [ ] Mockup's four primary colors are included
- [ ] No dependency on form state — pure controlled component (`value` + `onChange`)
- [ ] Works in dark theme (default app theme)

## Blocked by

None — can start immediately, parallel to 001.
