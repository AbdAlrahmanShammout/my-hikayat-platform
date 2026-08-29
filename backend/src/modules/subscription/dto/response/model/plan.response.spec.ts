import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanResponse } from './plan.response';

function createPaidPlanEntity(): PlanEntity {
  return new PlanEntity({
    id: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: 'monthly',
    name: 'Monthly',
    description: 'Monthly paid full-book reading',
    kind: PlanKind.MONTHLY_PAID,
    interval: PlanInterval.MONTH,
    stripePriceId: 'price_seed_monthly',
    amountCents: 999,
    currency: 'usd',
  });
}

describe('PlanResponse', () => {
  it('projects plan identity without Stripe price identifiers by default', () => {
    const actualResponse = new PlanResponse(createPaidPlanEntity());
    expect(actualResponse.slug).toBe('monthly');
    expect(actualResponse.description).toBe('Monthly paid full-book reading');
    expect(actualResponse.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualResponse.interval).toBe(PlanInterval.MONTH);
    expect(actualResponse.amountCents).toBe(999);
    expect(actualResponse.currency).toBe('usd');
    expect(actualResponse.stripePriceId).toBeUndefined();
  });

  it('includes Stripe price id when requested for admin responses', () => {
    const actualResponse = new PlanResponse(createPaidPlanEntity(), {
      includeStripePriceId: true,
    });
    expect(actualResponse.stripePriceId).toBe('price_seed_monthly');
  });
});
