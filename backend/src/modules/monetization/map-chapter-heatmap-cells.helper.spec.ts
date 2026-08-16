import { mapChapterHeatmapCells } from './map-chapter-heatmap-cells.helper';

describe('mapChapterHeatmapCells', () => {
  it('keeps spines with active time, hottest first, and labels unmatched chapters as null', () => {
    const actualCells = mapChapterHeatmapCells({
      chapterTotals: [
        { spineIndex: 0, activeDurationMs: 25000 },
        { spineIndex: 99, activeDurationMs: 8000 },
        { spineIndex: 1, activeDurationMs: 0 },
      ],
      bookChapters: [
        { spineIndex: 0, title: 'The Harbor' },
        { spineIndex: 1, title: 'The Storm' },
      ],
    });
    expect(actualCells).toEqual([
      { spineIndex: 0, title: 'The Harbor', activeDurationMs: 25000 },
      { spineIndex: 99, title: null, activeDurationMs: 8000 },
    ]);
  });
});
