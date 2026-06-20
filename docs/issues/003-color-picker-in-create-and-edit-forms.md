# 003 — ColorPicker in Create-Wizard + Edit-Screen

**Type:** AFK
**Status:** ready

## What to build

Wire the `ColorPicker` (from 002) into both habit forms:

1. **Create-Wizard (`app/habit/new.tsx`)** — add the picker as an additional field on **Step 1 (Cue)**, alongside Name/Emoji/Category. Defaults to the first color in the palette if user does not change it. Persists `color` to the new habit on save.

2. **Edit-Screen (`app/habit/[id].tsx`)** — add the picker in the editable fields section. Pre-fills with the habit's current `color` value (or `#7C3AED` if `NULL`). Saves on update.

No new wizard step. No required-field gating — color always has a value (default if not picked).

## Acceptance criteria

- [ ] Step 1 of Create-Wizard shows the ColorPicker
- [ ] Selected color is persisted on habit create
- [ ] Edit-Screen shows the ColorPicker pre-filled with current value
- [ ] Saving the edit updates `color` in DB
- [ ] No regression in existing Create-Wizard validation or navigation
- [ ] Habits created without explicit user color-pick get the palette's first color

## Blocked by

- 001 (DB column must exist)
- 002 (ColorPicker component must exist)
