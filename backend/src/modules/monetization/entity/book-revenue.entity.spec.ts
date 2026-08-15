import { BookRevenueEntity } from './book-revenue.entity';

describe('BookRevenueEntity', () => {
  it('holds the book share, platform cut, and author cents', () => {
    const actualEntity = new BookRevenueEntity({
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
    expect(actualEntity.ownerId).toBe(3);
    expect(actualEntity.authorCents).toBe(2500);
    expect(actualEntity.platformCutCents).toBe(1071);
  });
});
