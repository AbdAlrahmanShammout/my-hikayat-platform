import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';

import { ReadingVisualEngagementResponse } from './reading-visual-engagement.response';

describe('ReadingVisualEngagementResponse', () => {
  it('projects fixed-layout visual engagement fields', () => {
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
    const actualResponse = new ReadingVisualEngagementResponse(inputEntity);
    expect(actualResponse.userId).toBe(7);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.sessionId).toBe(9);
    expect(actualResponse.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualResponse.spreadIndex).toBe(1);
    expect(actualResponse.pageNumber).toBe(3);
    expect(actualResponse.activeDurationMs).toBe(15000);
    expect(actualResponse.visualSceneTimeMs).toBe(12000);
  });
});
