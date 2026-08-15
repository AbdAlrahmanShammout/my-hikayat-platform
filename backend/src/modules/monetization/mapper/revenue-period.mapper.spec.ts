import { Prisma } from '@prisma/client';

import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodType } from '@/modules/monetization/types/revenue-period-details-schema.type';

import { RevenuePeriodMapper } from './revenue-period.mapper';

describe('RevenuePeriodMapper', () => {
  it('maps a persistence payload onto a RevenuePeriodEntity', () => {
    const createdAt = new Date('2026-08-01T00:00:00.000Z');
    const updatedAt = new Date('2026-08-02T00:00:00.000Z');
    const inputSchema: RevenuePeriodType = {
      id: 4,
      createdAt,
      updatedAt,
      deletedAt: null,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      status: 'open',
      platformCutPercent: new Prisma.Decimal('25.50'),
      poolAmountCents: null,
    };
    const actualEntity = RevenuePeriodMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(4);
    expect(actualEntity.status).toBe(RevenuePeriodStatus.OPEN);
    expect(actualEntity.platformCutPercent).toBe(25.5);
    expect(actualEntity.poolAmountCents).toBeNull();
  });
});
