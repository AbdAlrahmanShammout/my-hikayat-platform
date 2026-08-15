import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

import { RevenuePeriodResponse } from './revenue-period.response';

describe('RevenuePeriodResponse', () => {
  it('projects period bounds, status, cut, and pool', () => {
    const inputEntity = new RevenuePeriodEntity({
      id: 4,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      status: RevenuePeriodStatus.OPEN,
      platformCutPercent: 30,
      poolAmountCents: 10000,
    });
    const actualResponse = new RevenuePeriodResponse(inputEntity);
    expect(actualResponse.status).toBe(RevenuePeriodStatus.OPEN);
    expect(actualResponse.platformCutPercent).toBe(30);
    expect(actualResponse.poolAmountCents).toBe(10000);
  });
});
