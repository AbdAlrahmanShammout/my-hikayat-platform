import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { GetAdminPeriodBookHeatmapResponseDto } from './get-admin-period-book-heatmap-response.dto';

describe('GetAdminPeriodBookHeatmapResponseDto', () => {
  it('maps spread cells onto the additive heatmap envelope', () => {
    const actualResponse = new GetAdminPeriodBookHeatmapResponseDto({
      bookId: 10,
      revenuePeriodId: 4,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreads: [
        { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
      ],
      chapters: [],
    });
    expect(actualResponse.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualResponse.spreads[0].activeDurationMs).toBe(180000);
    expect(actualResponse.chapters).toEqual([]);
  });
});
