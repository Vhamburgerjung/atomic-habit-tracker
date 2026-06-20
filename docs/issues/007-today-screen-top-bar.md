# 007 — Today-Screen: fixe Top-Bar

**Type:** AFK
**Status:** ready

## What to build

Add a fixed top app bar to the Today screen (`app/(tabs)/index.tsx`). Layout:

- Left: "Atomic" wordmark (text only, uses existing FONTS.display or matching weight) + optional bolt-style accent
- Right: Add-Icon (lucide `Plus`) — onPress → `router.push('/habit/new')`
- No leaderboard icon (deferred until Social/P2 feature exists)
- Background: same as screen background with subtle bottom border (`COLORS.border`) so it visually anchors when content scrolls beneath

Positioned within the safe-area top inset. Stays fixed when the habit list scrolls underneath.

Does NOT yet remove the greeting/ProgressRing/banner/FAB — that is owned by 008. After 007 ships, the screen will temporarily have BOTH the new top-bar AND the old chrome. 008 cleans up.

## Acceptance criteria

- [ ] Top bar renders fixed at top of Today screen
- [ ] Atomic wordmark left, Add-icon right
- [ ] Add-icon navigates to `/habit/new`
- [ ] Respects safe-area top inset
- [ ] Stays visible while scrolling the habit list
- [ ] Subtle bottom border separates from scroll content
- [ ] No leaderboard icon

## Blocked by

None — can start immediately, parallel to other tickets.
