# 010 — `useViewMode` hook (AsyncStorage-persisted)

**Type:** AFK
**Status:** ready

## What to build

Add a persisted view-mode state for the Today screen so the user's choice of dashboard layout survives app restarts.

**Install:** `npx expo install @react-native-async-storage/async-storage`

**New hook:** `src/hooks/useViewMode.ts`

- Returns `{ viewMode, setViewMode, isHydrated }`
- `viewMode: "full" | "compact" | "week"`
- Persisted in AsyncStorage under key `atomic.viewMode`
- Default `"full"` on first launch (and during hydration)
- `isHydrated` is `false` until AsyncStorage has been read once, then `true`

**Verification scaffold (temporary, removed in slice 011):**
In `app/(tabs)/index.tsx` render a tiny debug label showing the current `viewMode` value somewhere unobtrusive. No switcher UI yet — verify only via JS-debug toggling or AsyncStorage inspection that the value persists across reloads.

## Acceptance criteria

- [ ] `@react-native-async-storage/async-storage` installed via `expo install`
- [ ] `useViewMode()` hook returns `{ viewMode, setViewMode, isHydrated }`
- [ ] Default is `"full"` on first launch
- [ ] Setting a value writes to AsyncStorage and updates state
- [ ] Reading on next app start returns the previously written value
- [ ] No runtime warnings about un-awaited promises

## Blocked by

None — can start immediately.
