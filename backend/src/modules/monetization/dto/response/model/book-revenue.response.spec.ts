import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';

import { BookRevenueResponse } from './book-revenue.response';

describe('BookRevenueResponse', () => {
  it('projects author cents and pool share from the entity', () => {
    const inputEntity = new BookRevenueEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      revenuePeriodId: 4,
      bookId: 8,
      ownerId: 3,
      weightedEngagement: 2.5,
      poolShareCents: 3571,
      platformCutCents: 1071,
      authorCents: 2500,
    });
    const actualResponse = new BookRevenueResponse(inputEntity);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.authorCents).toBe(2500);
    expect(actualResponse.platformCutCents).toBe(1071);
  });
});
