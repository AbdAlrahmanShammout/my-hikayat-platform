import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanResponse } from './plan.response';

describe('PlanResponse', () => {
  it('projects plan identity without Stripe price identifiers', () => {
    const inputEntity = new PlanEntity({
      id: 2,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      slug: 'monthly',
      name: 'Monthly',
      kind: PlanKind.MONTHLY_PAID,
      interval: PlanInterval.MONTH,
    });
    const actualResponse = new PlanResponse(inputEntity);
    expect(actualResponse.slug).toBe('monthly');
    expect(actualResponse.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualResponse.interval).toBe(PlanInterval.MONTH);
    expect(actualResponse).not.toHaveProperty('stripePriceId');
  });
});
