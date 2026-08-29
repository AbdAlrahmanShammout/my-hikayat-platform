import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanMapper } from './plan.mapper';

describe('PlanMapper', () => {
  it('maps a persistence payload onto a PlanEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = PlanMapper.toEntity({
      id: 2,
      createdAt,
      updatedAt,
      deletedAt: null,
      slug: 'monthly',
      name: 'Monthly',
      description: 'Monthly paid full-book reading',
      kind: 'monthly_paid',
      interval: 'month',
      stripePriceId: 'price_seed_monthly',
      amountCents: 999,
      currency: 'usd',
    });
    expect(actualEntity.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualEntity.interval).toBe(PlanInterval.MONTH);
    expect(actualEntity.slug).toBe('monthly');
    expect(actualEntity.description).toBe('Monthly paid full-book reading');
    expect(actualEntity.stripePriceId).toBe('price_seed_monthly');
    expect(actualEntity.amountCents).toBe(999);
    expect(actualEntity.currency).toBe('usd');
  });
});
