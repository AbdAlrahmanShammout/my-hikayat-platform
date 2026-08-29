import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionMapper } from '@/modules/subscription/mapper/subscription.mapper';
import { subscriptionDetailsInclude } from '@/modules/subscription/types/subscription-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { SubscriptionPrismaRepository } from './subscription-prisma.repository';

describe('SubscriptionPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const startedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
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
    activatedAt: null,
    trialStartedAt: null,
    trialEndsAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: {
      id: 1,
      createdAt,
      updatedAt,
      deletedAt: null,
      slug: 'free',
      name: 'Free',
      description: 'Free tier without a credit card',
      kind: 'free',
      interval: null,
      stripePriceId: null,
      amountCents: null,
      currency: null,
    },
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    subscription: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let subscriptionPrismaRepository: SubscriptionPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      subscription: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    subscriptionPrismaRepository = new SubscriptionPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a subscription connected to a user and plan', async () => {
    mockPrismaProviderService.subscription.create.mockResolvedValue(persistenceRow);
    const actualEntity = await subscriptionPrismaRepository.create({
      userId: 5,
      planId: 1,
      status: SubscriptionStatus.ACTIVE,
      startedAt,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });
    expect(mockPrismaProviderService.subscription.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: 5 } },
        plan: { connect: { id: 1 } },
        status: SubscriptionStatus.ACTIVE,
        startedAt,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        activatedAt: null,
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
      include: subscriptionDetailsInclude,
    });
    expect(actualEntity).toEqual(SubscriptionMapper.toEntity(persistenceRow));
  });

  it('lists subscriptions filtered by user and status', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await subscriptionPrismaRepository.list({
      limit: 20,
      offset: 0,
      userId: 5,
      status: SubscriptionStatus.ACTIVE,
    });
    expect(mockPrismaProviderService.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, userId: 5, status: SubscriptionStatus.ACTIVE },
        include: subscriptionDetailsInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
  });

  it('finds a subscription by Stripe subscription id', async () => {
    mockPrismaProviderService.subscription.findFirst.mockResolvedValue({
      ...persistenceRow,
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
    });
    const actualEntity = await subscriptionPrismaRepository.findByStripeSubscriptionId('sub_1');
    expect(mockPrismaProviderService.subscription.findFirst).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_1', deletedAt: null },
      include: subscriptionDetailsInclude,
    });
    expect(actualEntity?.stripeSubscriptionId).toBe('sub_1');
  });

  it('starts a trial only when trialStartedAt is still null', async () => {
    const trialStartedAt = new Date('2026-08-16T12:00:00.000Z');
    const trialEndsAt = new Date('2026-08-23T12:00:00.000Z');
    mockPrismaProviderService.subscription.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaProviderService.subscription.findFirst.mockResolvedValue({
      ...persistenceRow,
      trialStartedAt,
      trialEndsAt,
    });
    const actualEntity = await subscriptionPrismaRepository.startTrialIfUnused({
      userId: 5,
      trialStartedAt,
      trialEndsAt,
    });
    expect(mockPrismaProviderService.subscription.updateMany).toHaveBeenCalledWith({
      where: { userId: 5, trialStartedAt: null, deletedAt: null },
      data: { trialStartedAt, trialEndsAt },
    });
    expect(actualEntity?.trialStartedAt).toEqual(trialStartedAt);
  });

  it('returns null when the trial CAS finds the trial already used', async () => {
    mockPrismaProviderService.subscription.updateMany.mockResolvedValue({ count: 0 });
    const actualEntity = await subscriptionPrismaRepository.startTrialIfUnused({
      userId: 5,
      trialStartedAt: new Date(),
      trialEndsAt: new Date(),
    });
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.subscription.findFirst).not.toHaveBeenCalled();
  });
});
