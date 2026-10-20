import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

import { RevenuePeriodEntity } from './revenue-period.entity';

describe('RevenuePeriodEntity', () => {
  it('holds the period window, status, and calculated pool', () => {
    const actualEntity = new RevenuePeriodEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      status: RevenuePeriodStatus.OPEN,
      poolAmountCents: null,
    });
    expect(actualEntity.status).toBe(RevenuePeriodStatus.OPEN);
    expect(actualEntity.poolAmountCents).toBeNull();
  });
});
