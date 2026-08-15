import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { SubscriptionAlreadyExistsException } from '@/modules/subscription/exceptions/subscription-already-exists.exception';
import { PlanService } from '@/modules/subscription/plan.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';

import { SubscriptionService } from './subscription.service';

function createSampleUser(): UserEntity {
  return new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

function createSamplePlan(kind = PlanKind.FREE): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
  });
}

function createSampleSubscription(): SubscriptionEntity {
  return new SubscriptionEntity({
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
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: createSamplePlan(),
  });
}

describe('SubscriptionService', () => {
  let mockSubscriptionRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
    list: jest.Mock;
  };
  let mockPlanService: { getPlanById: jest.Mock; getPlanBySlug: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    mockSubscriptionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      list: jest.fn(),
    };
    mockPlanService = { getPlanById: jest.fn(), getPlanBySlug: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    subscriptionService = new SubscriptionService(
      mockSubscriptionRepository,
      mockPlanService as unknown as PlanService,
      mockUserService as unknown as UserService,
    );
  });

  describe('createSubscription', () => {
    it('assigns an active plan to a user without an existing subscription', async () => {
      const expectedSubscription = createSampleSubscription();
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockPlanService.getPlanById.mockResolvedValue(createSamplePlan());
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(expectedSubscription);
      const actualSubscription = await subscriptionService.createSubscription({
        userId: 5,
        planId: 1,
      });
      expect(mockUserService.getUserById).toHaveBeenCalledWith(5);
      expect(mockPlanService.getPlanById).toHaveBeenCalledWith(1);
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith({
        userId: 5,
        planId: 1,
        status: SubscriptionStatus.ACTIVE,
        startedAt: expect.any(Date),
        currentPeriodStart: null,
        currentPeriodEnd: null,
      });
      expect(actualSubscription).toBe(expectedSubscription);
    });

    it('rejects a second subscription for the same user', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockPlanService.getPlanById.mockResolvedValue(createSamplePlan());
      mockSubscriptionRepository.findByUserId.mockResolvedValue(createSampleSubscription());
      await expect(
        subscriptionService.createSubscription({ userId: 5, planId: 1 }),
      ).rejects.toBeInstanceOf(SubscriptionAlreadyExistsException);
    });
  });

  describe('ensureFreeSubscription', () => {
    it('returns the existing subscription without creating another', async () => {
      const expectedSubscription = createSampleSubscription();
      mockSubscriptionRepository.findByUserId.mockResolvedValue(expectedSubscription);
      const actualSubscription = await subscriptionService.ensureFreeSubscription(5);
      expect(mockPlanService.getPlanBySlug).not.toHaveBeenCalled();
      expect(actualSubscription).toBe(expectedSubscription);
    });

    it('creates a free subscription when the user has none', async () => {
      const expectedSubscription = createSampleSubscription();
      mockSubscriptionRepository.findByUserId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPlanService.getPlanBySlug.mockResolvedValue(createSamplePlan());
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockPlanService.getPlanById.mockResolvedValue(createSamplePlan());
      mockSubscriptionRepository.create.mockResolvedValue(expectedSubscription);
      const actualSubscription = await subscriptionService.ensureFreeSubscription(5);
      expect(mockPlanService.getPlanBySlug).toHaveBeenCalledWith('free');
      expect(actualSubscription).toBe(expectedSubscription);
    });
  });

  describe('cancelSubscription', () => {
    it('marks an active subscription canceled', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(createSampleSubscription());
      mockSubscriptionRepository.update.mockResolvedValue(createSampleSubscription());
      await subscriptionService.cancelSubscription(7);
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith({
        id: 7,
        status: SubscriptionStatus.CANCELED,
        canceledAt: expect.any(Date),
      });
    });
  });

  describe('listSubscriptions', () => {
    it('lists with default pagination', async () => {
      mockSubscriptionRepository.list.mockResolvedValue({
        entities: [createSampleSubscription()],
        total: 1,
      });
      const actualPage = await subscriptionService.listSubscriptions();
      expect(mockSubscriptionRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        userId: undefined,
        status: undefined,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getSubscriptionByUserId', () => {
    it('throws when the user has no subscription', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      await expect(subscriptionService.getSubscriptionByUserId(5)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
