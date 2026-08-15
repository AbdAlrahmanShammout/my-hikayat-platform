import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingSessionEntity } from './reading-session.entity';

describe('ReadingSessionEntity', () => {
  it('holds an open reflowable session with zero durations', () => {
    const actualEntity = new ReadingSessionEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      startedAt: new Date('2026-01-01T01:00:00.000Z'),
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spineIndex: 2,
      scrollOffset: 480,
      spreadIndex: null,
      pageNumber: null,
    });
    expect(actualEntity.userId).toBe(4);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.endedAt).toBeNull();
    expect(actualEntity.activeDurationMs).toBe(0);
    expect(actualEntity.spineIndex).toBe(2);
  });
});
