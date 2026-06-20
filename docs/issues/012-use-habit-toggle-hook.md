# 012 — `useHabitToggle` hook (shared toggle logic)

**Type:** AFK
**Status:** ready

## What to build

Extract the habit-toggle logic (haptic + dispatch + XPToast trigger) into a shared hook so the new compact and week-row components can reuse it without duplicating the dispatch wiring.

**New hook:** `src/hooks/useHabitToggle.ts`

- Accepts the current list of `TodayHabitItem`s (or fetches via `useTodayDashboard` internally — pick whichever yields the cleaner call site at the consuming components) and exposes a `toggle(habitId, date)` function
- `toggle(habitId, date)`:
  - Fires `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
  - Dispatches `TOGGLE_CHECKOFF` with `{ habitId, date }`
  - If the habit was NOT already completed on that date AND `date` is today, computes the would-be new streak and returns toast info `{ xp, reward }` so the caller can surface the existing `XPToast`
  - For past-day toggles (date !== today), does NOT return toast info — XPToast suppressed for retroactive edits
- The hook surfaces the toast info via a callback prop (`onChecked?: (info: { xp, reward }) => void`) so consumers stay in control of toast state

**Refactor `src/components/HabitCard.tsx`** to use `useHabitToggle` instead of receiving `onToggle` + `onChecked` as props. Behavior must remain identical to today:
- Tap on CheckButton → toggle today, haptic, border pulse, XPToast appears
- Streak increments correctly

**Refactor `app/(tabs)/index.tsx`** to drop the now-unused `handleToggle` / `handleChecked` callbacks at the call site (or keep them if the hook surfaces info via callback — whichever fits the chosen hook shape). XPToast state stays in the Today screen.

## Acceptance criteria

- [ ] New `useHabitToggle` hook exists and encapsulates haptic + dispatch + toast-info computation
- [ ] `HabitCard` uses the hook; props signature simplified accordingly
- [ ] Toggling today in the full view still triggers haptic, border animation, and XPToast
- [ ] Streak increments visibly after a check-off
- [ ] Past-day toggles (used later in slice 014) do NOT trigger XPToast — verified via unit test or manual check using a dev-only date override
- [ ] No regressions in the existing full-view flow

## Blocked by

None — can start immediately, in parallel with 010 / 011.
