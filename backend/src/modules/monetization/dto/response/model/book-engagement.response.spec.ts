import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';

import { BookEngagementResponse } from './book-engagement.response';

describe('BookEngagementResponse', () => {
  it('projects duration buckets from the entity', () => {
    const inputEntity = new BookEngagementEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      revenuePeriodId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      activeReadingMs: 120000,
      activeSpreadMs: 0,
      visualSceneTimeMs: 0,
    });
    const actualResponse = new BookEngagementResponse(inputEntity);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.activeReadingMs).toBe(120000);
  });
});
