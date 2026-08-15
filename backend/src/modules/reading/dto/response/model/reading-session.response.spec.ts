import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';

import { ReadingSessionResponse } from './reading-session.response';

describe('ReadingSessionResponse', () => {
  it('projects an open reflowable session', () => {
    const inputEntity = new ReadingSessionEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      startedAt: new Date('2026-08-15T02:00:00.000Z'),
      endedAt: null,
      activeDurationMs: 15000,
      idleDurationMs: 3000,
      spineIndex: 2,
      scrollOffset: 640,
      spreadIndex: null,
      pageNumber: null,
    });
    const actualResponse = new ReadingSessionResponse(inputEntity);
    expect(actualResponse.userId).toBe(7);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.startedAt).toEqual(new Date('2026-08-15T02:00:00.000Z'));
    expect(actualResponse.endedAt).toBeNull();
    expect(actualResponse.activeDurationMs).toBe(15000);
    expect(actualResponse.idleDurationMs).toBe(3000);
    expect(actualResponse.spineIndex).toBe(2);
    expect(actualResponse.scrollOffset).toBe(640);
  });
});
