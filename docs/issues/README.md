# Issues — HabitCard Redesign

Vertical-slice tickets for the dashboard + HabitCard redesign. Generated from the design grilling on 2026-06-20.

## Order & dependencies

```
001 (HITL) DB migration ──┐
                          ├──> 003 ColorPicker in forms
002 ColorPicker component┘                                          ┌──> 008 Strip chrome ──> 009 Empty-state
                                                                    │
004 Heatmap data 112d ────┐                                         │
005 CheckButton color    ─┼──> 006 HabitCard redesign ──────────────┤
001 DB migration ────────┘                                          │
                                                                    │
007 Top-Bar ────────────────────────────────────────────────────────┘
```

## Tickets

| # | Title | Type | Blocked by |
|---|---|---|---|
| 001 | DB migration: `color` column | HITL | — |
| 002 | ColorPicker component (25 colors) | AFK | — |
| 003 | ColorPicker in Create + Edit forms | AFK | 001, 002 |
| 004 | Heatmap data: 112 days | AFK | — |
| 005 | CheckButton accepts color prop | AFK | — |
| 006 | HabitCard redesign | AFK | 001, 004, 005 |
| 007 | Today-Screen top-bar | AFK | — |
| 008 | Strip dashboard chrome + sort fix | AFK | 006, 007 |
| 009 | Empty-state refinish | AFK | 008 |
| 010 | `useViewMode` hook (AsyncStorage) | AFK | — |
| 011 | `ViewModeSwitcher` floating pill | AFK | 010 |
| 012 | `useHabitToggle` hook (shared) | AFK | — |
| 013 | `HabitCardCompact` + grid mode | AFK | 011, 012 |
| 014 | `WeekdayHeader` + `HabitWeekRow` + week mode | AFK | 011, 012 |
| 015 | `recentDays` extended to 365 days | AFK | — |
| 016 | Full-view 7×52 horizontal-scrollable year heatmap | AFK | 015 |
| 017 | Compact-view monthly calendar + 3-col grid | AFK | 015, 016 |

## Parallelizable starting points

After 001 lands, these can run in parallel: 002, 003, 004, 005, 007.
006 is the integration choke point — needs 001 + 004 + 005.
008 is the final cleanup — needs 006 + 007.

Dashboard views (010–014) are independent of the redesign chain above.
010 and 012 can start in parallel; 011 follows 010; 013 and 014 both need 011 + 012 and can run in parallel.
