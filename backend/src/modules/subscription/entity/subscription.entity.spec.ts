import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

import { SubscriptionEntity } from './subscription.entity';

describe('SubscriptionEntity', () => {
  it('holds the current plan assignment and billing window', () => {
    const actualEntity = new SubscriptionEntity({
      id: 7,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 5,
      planId: 1,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      currentPeriodStart: null,
      currentPeriodEnd: null,
      canceledAt: null,
      activatedAt: null,
      trialStartedAt: null,
      trialEndsAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      plan: new PlanEntity({
        id: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        slug: 'free',
        name: 'Free',
        kind: PlanKind.FREE,
        interval: null,
      }),
    });
    expect(actualEntity.userId).toBe(5);
    expect(actualEntity.status).toBe(SubscriptionStatus.ACTIVE);
    expect(actualEntity.plan?.kind).toBe(PlanKind.FREE);
  });
});
