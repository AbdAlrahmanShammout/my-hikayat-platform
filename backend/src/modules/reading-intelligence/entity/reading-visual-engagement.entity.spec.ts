import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingVisualEngagementEntity } from './reading-visual-engagement.entity';

describe('ReadingVisualEngagementEntity', () => {
  it('holds per-spread active time and visual scene time', () => {
    const actualEntity = new ReadingVisualEngagementEntity({
      id: 11,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    });
    expect(actualEntity.sessionId).toBe(9);
    expect(actualEntity.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualEntity.spreadIndex).toBe(1);
    expect(actualEntity.pageNumber).toBe(3);
    expect(actualEntity.activeDurationMs).toBe(15000);
    expect(actualEntity.visualSceneTimeMs).toBe(12000);
  });
});
