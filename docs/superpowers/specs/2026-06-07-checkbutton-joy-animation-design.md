# CheckButton Joy & Delight Animation

**Date:** 2026-06-07  
**Status:** Approved  
**Scope:** Check-off button ripple fill + sparkle burst + card border glow

---

## Problem

The habit check-off is the most frequent action in the app (every habit, every day). Today it produces a card scale squish (0.95→1) and a color swap on the circle. This feels functional, not delightful. The moment of completing a habit deserves a micro-celebration that reinforces positive identity.

---

## Decisions

| Question | Decision |
|---|---|
| Primary animation | Ripple fill from center, then checkmark fly-in |
| Particle style | 6 sparkle line segments radiating outward |
| Card interaction | Remove card scale; replace with border glow pulse |
| Architecture | Extract `CheckButton` as its own component |
| New packages | None — uses existing Reanimated v4 + expo-haptics |

---

## Architecture

### New file: `src/components/CheckButton.tsx`

Self-contained visual component. No side effects, no data access.

```ts
interface CheckButtonProps {
  isCompleted: boolean;
  accentColor: string;
  onPress: () => void;
}
```

Internally owns all animated values for: ripple scale, ripple opacity, border opacity, checkmark scale, and 6 sparkle line transforms.

### Modified file: `src/components/HabitCard.tsx`

- **Remove:** `const scale = useSharedValue(1)` and card-level `animatedStyle` scale transform
- **Remove:** `withSpring(0.95 → 1)` card bounce from `handleToggle`
- **Add:** `const borderColor = useSharedValue(...)` for animated border glow
- **Replace:** Static check circle `Pressable` → `<CheckButton isCompleted={isCompletedToday} accentColor={COLORS.accent} onPress={handleToggle} />`
- **Keep:** All toggle logic, `onChecked`, `onToggle`, haptics — unchanged

Haptics stay in `HabitCard.handleToggle` since it owns the toggle action. `CheckButton` is purely visual.

---

## Animation Sequence (on complete)

| Step | Start | Duration | Detail |
|---|---|---|---|
| Ripple fill | 0ms | 280ms | Circle scales 0→1 from center, `withSpring({ damping: 14, stiffness: 180 })`. The check circle's own border opacity: `withTiming(0, { duration: 200 })` — fades as fill expands. |
| Checkmark fly-in | 180ms | 170ms | `Check` icon scales 0→1 via `withDelay(180, withSpring({ damping: 12, stiffness: 200 }))`, slight overshoot. |
| Sparkle burst | 200ms | 300ms | 6 line segments (2×8px), 60° apart, 32px radius. Each: `withSequence(withTiming(1, 80ms), withTiming(0, 200ms))` + translate outward. Color: `COLORS.accent`. |
| Border glow | 0ms | 300ms | Card border: `withTiming(COLORS.success + "80", 300ms)`. |

**On uncomplete (reverse tap):** Fill fades out, border color returns to `COLORS.border`, checkmark disappears. No sparkles on uncomplete.

---

## Easing Values

```ts
// Ripple
withSpring(1, { damping: 14, stiffness: 180 })

// Checkmark
withSpring(1, { damping: 12, stiffness: 200 })

// Border glow, sparkle scale-in
withTiming(target, { duration: 300 })

// Sparkle scale-out
withTiming(0, { duration: 200 })
```

---

## Out of Scope

- Streak milestone screens (separate spec)
- XPToast animation upgrade
- Habit Detail screen reuse of `CheckButton` (future)
- ProgressRing or all-done banner changes

---

## Files Changed

| File | Action |
|---|---|
| `src/components/CheckButton.tsx` | Create |
| `src/components/HabitCard.tsx` | Modify |
