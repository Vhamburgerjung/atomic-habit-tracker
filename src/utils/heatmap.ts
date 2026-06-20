/**
 * Shared color rule for heatmap cells across Full and Compact views.
 *
 * - Done cell: full habit color (opacity 1).
 * - Not done but in an "active week" (week has at least one done cell):
 *   habit color at 0.2.
 * - Otherwise: habit color at 0.08.
 */
export function heatmapCellOpacity(opts: {
  isDone: boolean;
  isInActiveWeek: boolean;
}): number {
  if (opts.isDone) return 1;
  if (opts.isInActiveWeek) return 0.2;
  return 0.08;
}

/**
 * Given a list of weeks (each a list of booleans = done state per cell),
 * return the set of week indices that contain at least one done cell.
 */
export function computeActiveWeekSet(weeks: boolean[][]): Set<number> {
  const active = new Set<number>();
  weeks.forEach((week, idx) => {
    if (week.some(Boolean)) active.add(idx);
  });
  return active;
}
