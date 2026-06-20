# 017 — Compact-View: monthly calendar + 3-column grid

**Type:** AFK
**Status:** ready

## What to build

Replace the Compact HabitCard's 7×11 GitHub-style heatmap with a classic calendar view of the current month, and switch the Today screen's compact layout from 2 columns to 3.

**Header layout (per card):**
- Icon box on the left (same look as today, slightly smaller if needed to fit).
- Right of the icon: a two-line text column.
  - Line 1: habit name (`numberOfLines={1}`, `FONTS.medium`).
  - Line 2: localized month + year, e.g. `Juni 2026`, `FONTS.medium`, `fontSize: 11`, `COLORS.muted`. Use `toLocaleDateString("de-DE", { month: "long", year: "numeric" })`.

**Calendar layout:**
- 7 columns (Mon→Sun).
- Number of rows is **dynamic** for the current month: either 5 or 6 depending on where the 1st of the month falls. All compact cards in a given month show the same number of rows, so the grid stays uniform.
- Each row = one calendar week (Mon-anchored).
- Cells outside the current month (days from the previous or next month visible in the week-aligned grid) are rendered with the same baseline opacity rule as everything else — no special grey/border treatment.
- Cells use `flex: 1` with `aspectRatio: 1` and a small gap (~2px) so they scale to whatever width 1/3 of the screen ends up being.

**Color rule (same as slice 016):**
- Completed: full habit color, opacity 1.
- Not completed but in an "active week" (the row has at least one completed cell): habit color, opacity 0.2.
- Else (baseline — pre-creation, outside `recentDays`, out-of-month, future, post-creation not done in an inactive week): habit color, opacity 0.08.
- Today's cell gets a small accent-colored dot rendered inside it.
- Reuse the active-week helper introduced in slice 016.

**Interactions:**
- Tap on card → toggle today (unchanged from current behavior).
- Long-press on card → detail screen (unchanged).
- Calendar cells inert.

**Today screen integration:**
- Switch the `viewMode === "compact"` branch from a 2-column grid (`width: "48%"`) to a 3-column grid. Use `width: "31.5%"` or compute via `(containerWidth - gaps) / 3`. Keep the same `gap: 12` between cards.
- Card padding and content density may need to drop slightly so the calendar + 2-line header fit cleanly at ~102px-wide cards.

## Acceptance criteria

- [ ] Compact card header shows icon + two-line text (name + month/year)
- [ ] Month name is localized to German
- [ ] Calendar shows Mon→Sun columns
- [ ] Row count is dynamic (5 or 6) and equal across all cards in the current month
- [ ] Cells use flex-based sizing and stay square
- [ ] Color rule matches slice 016 (done = full, active-week = 0.2, baseline = 0.08, today = accent dot)
- [ ] Cells are inert; tap toggles today; long-press opens detail
- [ ] Today screen renders 3 compact cards per row at standard phone widths

## Blocked by

- 015 (`recentDays` covers 365 days)
- 016 (active-week helper extracted)
