import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';

import { SubscriptionResponse } from './subscription.response';

describe('SubscriptionResponse', () => {
  it('projects billing status and omits Stripe identifiers', () => {
    const inputEntity = new SubscriptionEntity({
      id: 7,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 5,
      planId: 2,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
      canceledAt: null,
      stripeCustomerId: 'cus_secret',
      stripeSubscriptionId: 'sub_secret',
      plan: new PlanEntity({
        id: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        slug: 'monthly',
        name: 'Monthly',
        kind: PlanKind.MONTHLY_PAID,
        interval: PlanInterval.MONTH,
      }),
    });
    const actualResponse = new SubscriptionResponse(inputEntity);
    expect(actualResponse.userId).toBe(5);
    expect(actualResponse.status).toBe(SubscriptionStatus.ACTIVE);
    expect(actualResponse.plan?.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualResponse).not.toHaveProperty('stripeCustomerId');
    expect(actualResponse).not.toHaveProperty('stripeSubscriptionId');
  });
});
