import { Prisma } from '@prisma/client';

import { BookRevenueType } from '@/modules/monetization/types/book-revenue-details-schema.type';

import { BookRevenueMapper } from './book-revenue.mapper';

describe('BookRevenueMapper', () => {
  it('maps a persistence payload onto a BookRevenueEntity', () => {
    const createdAt = new Date('2026-08-01T00:00:00.000Z');
    const updatedAt = new Date('2026-08-02T00:00:00.000Z');
    const inputSchema: BookRevenueType = {
      id: 4,
      createdAt,
      updatedAt,
      deletedAt: null,
      revenuePeriodId: 2,
      bookId: 8,
      ownerId: 3,
      weightedEngagement: new Prisma.Decimal('2.50000000'),
      poolShareCents: 3571,
      platformCutCents: 1071,
      authorCents: 2500,
    };
    const actualEntity = BookRevenueMapper.toEntity(inputSchema);
    expect(actualEntity.weightedEngagement).toBe(2.5);
    expect(actualEntity.authorCents).toBe(2500);
    expect(actualEntity.ownerId).toBe(3);
  });
});
