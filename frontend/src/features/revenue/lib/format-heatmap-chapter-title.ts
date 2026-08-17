/**
 * Displays a reflowable chapter title from the heatmap payload.
 */
export function formatHeatmapChapterTitle(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'No title';
  }
  return value;
}
