import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { BookEngagementEntity } from './book-engagement.entity';

describe('BookEngagementEntity', () => {
  it('holds period, book, layout, durations, and weighted engagement', () => {
    const actualEntity = new BookEngagementEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      revenuePeriodId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      activeReadingMs: 120000,
      activeSpreadMs: 0,
      visualSceneTimeMs: 0,
      categoryWeight: 1.25,
      weightedEngagement: 2.5,
    });
    expect(actualEntity.revenuePeriodId).toBe(4);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.weightedEngagement).toBe(2.5);
  });
});
