/**
 * Shared color rule for heatmap cells across Full and Compact views.
 *
 * - Done cell: full habit color (opacity 1).
 * - Halo cell (grid-adjacent to a done cell, Chebyshev distance 1):
 *   habit color at 0.25.
 * - Otherwise: habit color at 0.08.
 */
export function heatmapCellOpacity(opts: {
  isDone: boolean;
  isInHalo: boolean;
}): number {
  if (opts.isDone) return 1;
  if (opts.isInHalo) return 0.25;
  return 0.08;
}

/**
 * Build the set of grid coordinates that sit within Chebyshev distance 1
 * (the 8 surrounding cells) of any done cell. Done cells themselves are
 * not included in the halo.
 *
 * Grid is `boolean[][]` where outer index = i, inner index = j.
 * Returned keys are `"i,j"` strings — look up with `halo.has(\`${i},${j}\`)`.
 */
export function computeHaloSet(grid: boolean[][]): Set<string> {
  const halo = new Set<string>();
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      if (!row[j]) continue;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di;
          const nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= grid.length) continue;
          if (nj >= grid[ni].length) continue;
          if (grid[ni][nj]) continue;
          halo.add(`${ni},${nj}`);
        }
      }
    }
  }
  return halo;
}
