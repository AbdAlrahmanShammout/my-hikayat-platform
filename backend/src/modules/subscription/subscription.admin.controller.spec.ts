import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { SubscriptionAdminController } from './subscription.admin.controller';

function createSamplePlan(): PlanEntity {
  return new PlanEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: 'free',
    name: 'Free',
    kind: PlanKind.FREE,
    interval: null,
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

function createSampleAdmin(): UserEntity {
  return new UserEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    isPublisher: false,
  });
}

describe('SubscriptionAdminController', () => {
  let subscriptionAdminController: SubscriptionAdminController;
  let mockSubscriptionService: { listSubscriptions: jest.Mock; getSubscriptionById: jest.Mock };
  let mockSubscriptionBillingService: { cancelManagedSubscription: jest.Mock };

  beforeEach(async () => {
    mockSubscriptionService = { listSubscriptions: jest.fn(), getSubscriptionById: jest.fn() };
    mockSubscriptionBillingService = { cancelManagedSubscription: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [SubscriptionAdminController],
      providers: [
        { provide: SubscriptionService, useValue: mockSubscriptionService },
        { provide: SubscriptionBillingService, useValue: mockSubscriptionBillingService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    subscriptionAdminController = moduleRef.get(SubscriptionAdminController);
  });

  describe('listSubscriptions', () => {
    it('forwards filters into the list envelope', async () => {
      mockSubscriptionService.listSubscriptions.mockResolvedValue({
        entities: [createSampleSubscription()],
        total: 1,
      });
      const actualResponse = await subscriptionAdminController.listSubscriptions({
        limit: 10,
        offset: 0,
        userId: 5,
        status: SubscriptionStatus.ACTIVE,
      });
      expect(mockSubscriptionService.listSubscriptions).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        userId: 5,
        status: SubscriptionStatus.ACTIVE,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.subscriptions[0].id).toBe(7);
      expect(actualResponse.subscriptions[0]).not.toHaveProperty('stripeSubscriptionId');
    });
  });

  describe('getSubscription', () => {
    it('returns the requested subscription', async () => {
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(createSampleSubscription());
      const actualResponse = await subscriptionAdminController.getSubscription(7);
      expect(mockSubscriptionService.getSubscriptionById).toHaveBeenCalledWith(7);
      expect(actualResponse.userId).toBe(5);
    });
  });

  describe('cancelSubscription', () => {
    it('threads the signed-in admin as actor', async () => {
      const canceled = new SubscriptionEntity({
        ...createSampleSubscription(),
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date('2026-08-15T00:00:00.000Z'),
      });
      mockSubscriptionBillingService.cancelManagedSubscription.mockResolvedValue(canceled);
      const actualResponse = await subscriptionAdminController.cancelSubscription(
        7,
        createSampleAdmin(),
      );
      expect(mockSubscriptionBillingService.cancelManagedSubscription).toHaveBeenCalledWith({
        subscriptionId: 7,
        actorUserId: 9,
      });
      expect(actualResponse.status).toBe(SubscriptionStatus.CANCELED);
    });
  });
});
