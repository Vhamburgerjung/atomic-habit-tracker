# 008 — Today-Screen: alten Dashboard-Chrome entfernen + Sort fix

**Type:** AFK
**Status:** ready

## What to build

Strip the legacy dashboard chrome from `app/(tabs)/index.tsx` to match the minimal mockup layout. After this ticket, the Today screen contains only: Top-Bar (from 007) + sorted habit list (cards from 006) + Confetti + XPToast.

**Remove from render:**
- Greeting ("Good morning/afternoon/evening")
- Date subtitle
- ProgressRing block
- All-Done celebration banner (and its animated state + `showDoneBanner`, `bannerOpacity`, `bannerTranslateY`, `bannerScale`)
- FAB (the floating `+` button bottom-right — Add now lives in Top-Bar)
- "Today's Habits" headline

**Keep:**
- `ConfettiBlast` — still fires via `celebrationKey` on last check-off
- `XPToast` — still fires on each check-off
- The `triggerCelebration` logic, but only the confetti side of it (drop the banner-anim block). XPToast `onDone` still fires confetti when `isAllDoneRef.current` is true.

**Sort change:**
- Replace the current `.sort((a, b) => Number(a.isCompletedToday) - Number(b.isCompletedToday))` in `useTodayDashboard` with `.sort((a, b) => a.createdAt.localeCompare(b.createdAt))` (oldest first, fixed order). Completed cards stay in place — no re-sort, no opacity dim.

## Acceptance criteria

- [ ] No greeting/date rendered on Today screen
- [ ] No ProgressRing rendered
- [ ] No All-Done banner rendered (banner-related state can be deleted)
- [ ] No FAB rendered
- [ ] No "Today's Habits" headline
- [ ] Confetti still fires when last habit gets checked off
- [ ] XPToast still fires on each check-off
- [ ] Cards sorted by `createdAt` ascending, position stable across check-offs
- [ ] No dead imports / unused state hooks left behind

## Blocked by

- 007 (top-bar must exist before FAB is removed, otherwise no way to add habit)
- 006 (cards must work in their new shape — otherwise we'd strip chrome around a broken card)
