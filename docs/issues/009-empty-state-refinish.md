# 009 — Empty-State: Refinish auf neues Vibe

**Type:** AFK
**Status:** ready

## What to build

Light visual refresh of `src/components/EmptyState.tsx` to match the minimal mockup tone. Goals: darker, less text, more breathing room.

- Reduce copy to a short headline + one supporting line (cut anything verbose)
- Use a single subtle accent (no bright marketing colors)
- CTA stays a button to `/habit/new`, but styled lighter (outlined or low-emphasis), since the Top-Bar Add-icon is now the primary entry
- Spacing tuned to feel calm — vertical centering with generous padding

Functionality unchanged: same `onPress` prop, same callsite.

## Acceptance criteria

- [ ] Copy shortened to a headline + one supporting line max
- [ ] Visual tone matches the darker, minimal mockup look
- [ ] CTA button still navigates to `/habit/new`
- [ ] No regression at the callsite in `app/(tabs)/index.tsx`

## Blocked by

- 008 (so the refresh matches the surrounding stripped layout)
