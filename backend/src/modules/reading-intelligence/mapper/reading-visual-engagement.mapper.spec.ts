import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementType } from '@/modules/reading-intelligence/types/reading-visual-engagement-details-schema.type';

import { ReadingVisualEngagementMapper } from './reading-visual-engagement.mapper';

describe('ReadingVisualEngagementMapper', () => {
  it('maps a persistence payload onto a ReadingVisualEngagementEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: ReadingVisualEngagementType = {
      id: 11,
      createdAt,
      updatedAt,
      deletedAt: null,
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    };
    const actualEntity = ReadingVisualEngagementMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(11);
    expect(actualEntity.sessionId).toBe(9);
    expect(actualEntity.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualEntity.spreadIndex).toBe(1);
    expect(actualEntity.pageNumber).toBe(3);
    expect(actualEntity.activeDurationMs).toBe(15000);
    expect(actualEntity.visualSceneTimeMs).toBe(12000);
  });
});
