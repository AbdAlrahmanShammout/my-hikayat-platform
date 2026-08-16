import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingChapterEngagementEntity } from './reading-chapter-engagement.entity';

describe('ReadingChapterEngagementEntity', () => {
  it('holds per-chapter active time for a reflowable session', () => {
    const actualEntity = new ReadingChapterEngagementEntity({
      id: 12,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      activeDurationMs: 15000,
    });
    expect(actualEntity.sessionId).toBe(9);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.spineIndex).toBe(2);
    expect(actualEntity.activeDurationMs).toBe(15000);
  });
});
