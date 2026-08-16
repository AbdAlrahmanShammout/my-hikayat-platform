import {
  BookHeatmapChapterCell,
  MapChapterHeatmapCellsInput,
} from '@/modules/monetization/defs/book-heatmap-service.defs';

export function mapChapterHeatmapCells(
  input: MapChapterHeatmapCellsInput,
): BookHeatmapChapterCell[] {
  const titles = new Map<number, string>();
  for (const chapter of input.bookChapters) {
    if (!titles.has(chapter.spineIndex)) {
      titles.set(chapter.spineIndex, chapter.title);
    }
  }
  return input.chapterTotals
    .filter((total) => total.activeDurationMs > 0)
    .map((total) => ({
      spineIndex: total.spineIndex,
      title: titles.get(total.spineIndex) ?? null,
      activeDurationMs: total.activeDurationMs,
    }));
}
