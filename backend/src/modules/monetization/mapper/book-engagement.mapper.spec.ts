import { Prisma } from '@prisma/client';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementType } from '@/modules/monetization/types/book-engagement-details-schema.type';

import { BookEngagementMapper } from './book-engagement.mapper';

describe('BookEngagementMapper', () => {
  it('maps a persistence payload onto a BookEngagementEntity', () => {
    const createdAt = new Date('2026-08-01T00:00:00.000Z');
    const updatedAt = new Date('2026-08-02T00:00:00.000Z');
    const inputSchema: BookEngagementType = {
      id: 4,
      createdAt,
      updatedAt,
      deletedAt: null,
      revenuePeriodId: 2,
      bookId: 8,
      layoutType: 'reflowable',
      activeReadingMs: 120000,
      activeSpreadMs: 0,
      visualSceneTimeMs: 0,
      categoryWeight: new Prisma.Decimal('1.2500'),
      weightedEngagement: new Prisma.Decimal('2.50000000'),
    };
    const actualEntity = BookEngagementMapper.toEntity(inputSchema);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.categoryWeight).toBe(1.25);
    expect(actualEntity.weightedEngagement).toBe(2.5);
  });
});
