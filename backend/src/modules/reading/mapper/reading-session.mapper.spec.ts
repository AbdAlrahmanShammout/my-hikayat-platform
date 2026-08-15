import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionType } from '@/modules/reading/types/reading-session-details-schema.type';

import { ReadingSessionMapper } from './reading-session.mapper';

describe('ReadingSessionMapper', () => {
  it('maps a persistence payload onto a ReadingSessionEntity', () => {
    const startedAt = new Date('2026-01-01T01:00:00.000Z');
    const endedAt = new Date('2026-01-01T01:20:00.000Z');
    const inputSchema: ReadingSessionType = {
      id: 9,
      createdAt: startedAt,
      updatedAt: endedAt,
      deletedAt: null,
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      startedAt,
      endedAt,
      activeDurationMs: 900_000,
      idleDurationMs: 120_000,
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 1,
      pageNumber: 3,
    };
    const actualEntity = ReadingSessionMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(9);
    expect(actualEntity.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualEntity.endedAt).toBe(endedAt);
    expect(actualEntity.activeDurationMs).toBe(900_000);
    expect(actualEntity.spreadIndex).toBe(1);
    expect(actualEntity.spineIndex).toBeNull();
  });
});
