# 005 — CheckButton: dynamische Habit-Farbe als Prop

**Type:** AFK
**Status:** ready

## What to build

`CheckButton` currently uses a fixed `COLORS.accent` for its filled state, glow shadow, and joy animation. The new design gives each habit its own color, so the button must reflect the habit's `color`.

Changes:
- `CheckButton` already has an `accentColor` prop — verify it is plumbed through to all visual layers (filled background, glow `shadowColor`, animation tint)
- Behavior, haptics, joy animation, confetti-trigger callbacks all stay intact
- Default to `#7C3AED` when `accentColor` is undefined (covers existing callers)

Note: the visual restyle (border-outline state when not completed, glow when completed) is owned by 006 (HabitCard redesign). This ticket is only about color propagation.

## Acceptance criteria

- [ ] `accentColor` prop drives filled background color
- [ ] `accentColor` prop drives `shadowColor` for glow
- [ ] `accentColor` prop drives the joy animation tint where applicable
- [ ] Existing haptics + animation + onPress callbacks unchanged
- [ ] Default fallback color when prop omitted

## Blocked by

None — can start immediately.
