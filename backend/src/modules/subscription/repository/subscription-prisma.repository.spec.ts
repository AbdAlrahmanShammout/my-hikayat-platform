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
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    subscription: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
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
});
