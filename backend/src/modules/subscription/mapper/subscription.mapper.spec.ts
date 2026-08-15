import { SubscriptionMapper } from './subscription.mapper';

describe('SubscriptionMapper', () => {
  it('maps a persistence payload onto a SubscriptionEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const startedAt = new Date('2026-01-01T00:00:00.000Z');
    const actualEntity = SubscriptionMapper.toEntity({
      id: 7,
      createdAt,
      updatedAt,
      deletedAt: null,
      userId: 5,
      planId: 1,
      status: 'active',
      startedAt,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      canceledAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      plan: {
        id: 1,
        createdAt,
        updatedAt,
        deletedAt: null,
        slug: 'free',
        name: 'Free',
        kind: 'free',
        interval: null,
      },
    });
    expect(actualEntity.userId).toBe(5);
    expect(actualEntity.planId).toBe(1);
    expect(actualEntity.plan?.slug).toBe('free');
  });
});
