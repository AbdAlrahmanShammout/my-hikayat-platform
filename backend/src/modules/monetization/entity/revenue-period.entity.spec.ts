import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

import { RevenuePeriodEntity } from './revenue-period.entity';

describe('RevenuePeriodEntity', () => {
  it('holds the period window, status, and snapshotted platform cut', () => {
    const actualEntity = new RevenuePeriodEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      status: RevenuePeriodStatus.OPEN,
      platformCutPercent: 25,
      poolAmountCents: null,
    });
    expect(actualEntity.status).toBe(RevenuePeriodStatus.OPEN);
    expect(actualEntity.platformCutPercent).toBe(25);
    expect(actualEntity.poolAmountCents).toBeNull();
  });
});
