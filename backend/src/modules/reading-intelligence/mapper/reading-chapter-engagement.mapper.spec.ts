import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementType } from '@/modules/reading-intelligence/types/reading-chapter-engagement-details-schema.type';

import { ReadingChapterEngagementMapper } from './reading-chapter-engagement.mapper';

describe('ReadingChapterEngagementMapper', () => {
  it('maps a persistence payload onto a ReadingChapterEngagementEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: ReadingChapterEngagementType = {
      id: 12,
      createdAt,
      updatedAt,
      deletedAt: null,
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      activeDurationMs: 15000,
    };
    const actualEntity = ReadingChapterEngagementMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(12);
    expect(actualEntity.sessionId).toBe(9);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.spineIndex).toBe(2);
    expect(actualEntity.activeDurationMs).toBe(15000);
  });
});
