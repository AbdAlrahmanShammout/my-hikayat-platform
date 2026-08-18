/**
 * Presentational bar width from the hottest cell in the returned heatmap payload.
 */
export function getHeatmapBarPercent(activeDurationMs: number, maxActiveDurationMs: number): number {
  if (maxActiveDurationMs <= 0 || activeDurationMs <= 0) {
    return 0;
  }
  return Math.round((activeDurationMs / maxActiveDurationMs) * 100);
}
