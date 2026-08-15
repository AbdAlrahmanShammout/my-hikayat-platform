import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanEntity } from './plan.entity';

describe('PlanEntity', () => {
  it('holds a slug, kind, and optional billing interval', () => {
    const actualEntity = new PlanEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      slug: 'monthly',
      name: 'Monthly',
      kind: PlanKind.MONTHLY_PAID,
      interval: PlanInterval.MONTH,
    });
    expect(actualEntity.slug).toBe('monthly');
    expect(actualEntity.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualEntity.interval).toBe(PlanInterval.MONTH);
  });
});
