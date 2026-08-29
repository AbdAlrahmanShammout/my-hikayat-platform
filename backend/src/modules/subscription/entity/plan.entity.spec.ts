import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanEntity } from './plan.entity';

describe('PlanEntity', () => {
  it('holds catalog fields including optional Stripe price metadata', () => {
    const actualEntity = new PlanEntity({
      id: 1,
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
    expect(actualEntity.slug).toBe('monthly');
    expect(actualEntity.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualEntity.interval).toBe(PlanInterval.MONTH);
    expect(actualEntity.stripePriceId).toBe('price_seed_monthly');
    expect(actualEntity.amountCents).toBe(999);
  });
});
