import { AuthorBookChapterHeatmapCellResponse } from './author-book-chapter-heatmap-cell.response';

describe('AuthorBookChapterHeatmapCellResponse', () => {
  it('maps a chapter heatmap cell onto the wire shape', () => {
    const actualResponse = new AuthorBookChapterHeatmapCellResponse({
      spineIndex: 0,
      title: 'The Harbor',
      activeDurationMs: 120000,
    });
    expect(actualResponse.spineIndex).toBe(0);
    expect(actualResponse.title).toBe('The Harbor');
    expect(actualResponse.activeDurationMs).toBe(120000);
  });

  it('preserves a null title for an unmatched spine index', () => {
    const actualResponse = new AuthorBookChapterHeatmapCellResponse({
      spineIndex: 99,
      title: null,
      activeDurationMs: 8000,
    });
    expect(actualResponse.title).toBeNull();
  });
});
