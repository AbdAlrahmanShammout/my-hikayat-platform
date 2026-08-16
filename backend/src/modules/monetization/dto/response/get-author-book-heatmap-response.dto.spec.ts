import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { GetAuthorBookHeatmapResponseDto } from './get-author-book-heatmap-response.dto';

describe('GetAuthorBookHeatmapResponseDto', () => {
  it('maps spread and chapter cells onto the additive heatmap envelope', () => {
    const actualResponse = new GetAuthorBookHeatmapResponseDto({
      bookId: 10,
      revenuePeriodId: 4,
      layoutType: BookLayoutType.REFLOWABLE,
      spreads: [],
      chapters: [
        { spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 },
        { spineIndex: 99, title: null, activeDurationMs: 8000 },
      ],
    });
    expect(actualResponse.bookId).toBe(10);
    expect(actualResponse.revenuePeriodId).toBe(4);
    expect(actualResponse.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.spreads).toEqual([]);
    expect(actualResponse.chapters).toEqual([
      { spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 },
      { spineIndex: 99, title: null, activeDurationMs: 8000 },
    ]);
  });
});
