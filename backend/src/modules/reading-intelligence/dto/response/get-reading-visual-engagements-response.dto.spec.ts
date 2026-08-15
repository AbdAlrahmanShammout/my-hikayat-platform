import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';

import { GetReadingVisualEngagementsResponseDto } from './get-reading-visual-engagements-response.dto';

describe('GetReadingVisualEngagementsResponseDto', () => {
  it('maps a visual engagement page into the collection envelope', () => {
    const inputEntity = new ReadingVisualEngagementEntity({
      id: 11,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    });
    const actualResponse = new GetReadingVisualEngagementsResponseDto({
      entities: [inputEntity],
      total: 2,
    });
    expect(actualResponse.total).toBe(2);
    expect(actualResponse.visualEngagements).toHaveLength(1);
    expect(actualResponse.visualEngagements[0].id).toBe(11);
    expect(actualResponse.visualEngagements[0].spreadIndex).toBe(1);
    expect(actualResponse.visualEngagements[0].visualSceneTimeMs).toBe(12000);
  });
});
