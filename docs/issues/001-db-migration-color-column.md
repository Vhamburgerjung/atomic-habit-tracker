# 001 — DB-Migration: `color`-Column auf `habits`

**Type:** HITL
**Status:** ready

## What to build

Add a nullable `color` column (TEXT, stores hex string like `#7C3AED`) to the `habits` table in Supabase. User runs the SQL manually in the Supabase Dashboard SQL Editor. Then update the TypeScript `Habit` type in `src/store/useHabitStore.ts` (and any shared type files) so `color?: string` is part of the model. Update queries/mutations that read/write habits so the field round-trips.

No data backfill — existing rows stay `NULL`. The HabitCard render layer (issue 004) will fall back to `#7C3AED` when `NULL`.

## Acceptance criteria

- [ ] SQL snippet documented in this issue body for the user to copy/paste
- [ ] `Habit` type includes `color?: string`
- [ ] `useHabits` / habit mutations select & write `color` field
- [ ] No runtime errors when fetching existing habits with `color = NULL`
- [ ] User has confirmed the migration ran on remote Supabase

## SQL to run

```sql
ALTER TABLE habits ADD COLUMN color text;
```

## Blocked by

None — can start immediately.
