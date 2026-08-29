import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

import { GetSubscriptionsResponseDto } from './get-subscriptions-response.dto';

describe('GetSubscriptionsResponseDto', () => {
  it('maps a page of subscriptions onto the list envelope', () => {
    const entity = new SubscriptionEntity({
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
    const actualResponse = new GetSubscriptionsResponseDto({ entities: [entity], total: 4 });
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.subscriptions).toHaveLength(1);
    expect(actualResponse.subscriptions[0].id).toBe(7);
    expect(actualResponse.subscriptions[0]).not.toHaveProperty('stripeSubscriptionId');
  });
});
