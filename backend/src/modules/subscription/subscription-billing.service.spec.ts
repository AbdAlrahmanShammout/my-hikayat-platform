import { AppConfigService } from '@/config/app/app-config.service';
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { CheckoutReturnUrlInvalidException } from '@/modules/subscription/exceptions/checkout-return-url-invalid.exception';
import { SubscriptionAlreadyPaidException } from '@/modules/subscription/exceptions/subscription-already-paid.exception';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

import { SubscriptionBillingService } from './subscription-billing.service';

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

function createSampleSubscription(
  kind = PlanKind.FREE,
  status = SubscriptionStatus.ACTIVE,
): SubscriptionEntity {
  const plan = createSamplePlan(kind);
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: status === SubscriptionStatus.CANCELED ? new Date() : null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('SubscriptionBillingService', () => {
  let mockSubscriptionService: {
    findSubscriptionByUserId: jest.Mock;
    getSubscriptionByUserId: jest.Mock;
    ensureFreeSubscription: jest.Mock;
    updateSubscription: jest.Mock;
    cancelSubscription: jest.Mock;
  };
  let mockSubscriptionRepository: {
    findByStripeSubscriptionId: jest.Mock;
    findByStripeCustomerId: jest.Mock;
  };
  let mockPlanService: { getPlanBySlug: jest.Mock };
  let mockUserService: { getUserById: jest.Mock; findUserById: jest.Mock };
  let mockStripeManagerService: {
    createCustomer: jest.Mock;
    createCheckoutSession: jest.Mock;
    processWebhook: jest.Mock;
  };
  let mockAppConfigService: { allowedOrigins: string[] };
  let subscriptionBillingService: SubscriptionBillingService;

  beforeEach(() => {
    mockSubscriptionService = {
      findSubscriptionByUserId: jest.fn(),
      getSubscriptionByUserId: jest.fn(),
      ensureFreeSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };
    mockSubscriptionRepository = {
      findByStripeSubscriptionId: jest.fn(),
      findByStripeCustomerId: jest.fn(),
    };
    mockPlanService = { getPlanBySlug: jest.fn() };
    mockUserService = { getUserById: jest.fn(), findUserById: jest.fn() };
    mockStripeManagerService = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      processWebhook: jest.fn(),
    };
    mockAppConfigService = { allowedOrigins: ['http://localhost:3000'] };
    subscriptionBillingService = new SubscriptionBillingService(
      mockSubscriptionService as unknown as SubscriptionService,
      mockSubscriptionRepository as unknown as SubscriptionRepository,
      mockPlanService as unknown as PlanService,
      mockUserService as unknown as UserService,
      mockStripeManagerService as unknown as StripeManagerService,
      mockAppConfigService as unknown as AppConfigService,
    );
  });

  describe('startCheckout', () => {
    it('creates a Stripe customer then returns a hosted checkout url', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(),
      );
      mockStripeManagerService.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
      mockSubscriptionService.updateSubscription.mockResolvedValue(createSampleSubscription());
      mockStripeManagerService.createCheckoutSession.mockResolvedValue({
        checkoutSessionId: 'cs_1',
        url: 'https://checkout.stripe.test/cs_1',
      });
      const actualResult = await subscriptionBillingService.startCheckout({
        userId: 5,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
      expect(mockStripeManagerService.createCustomer).toHaveBeenCalledWith({
        email: 'reader@example.com',
        clientReferenceId: '5',
      });
      expect(mockStripeManagerService.createCheckoutSession).toHaveBeenCalledWith({
        customerId: 'cus_1',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
        clientReferenceId: '5',
      });
      expect(actualResult).toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    });

    it('rejects checkout when the user is already on an active monthly plan', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await expect(
        subscriptionBillingService.startCheckout({
          userId: 5,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      ).rejects.toBeInstanceOf(SubscriptionAlreadyPaidException);
    });

    it('rejects a return URL outside the allowed origins', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      await expect(
        subscriptionBillingService.startCheckout({
          userId: 5,
          successUrl: 'https://evil.test/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      ).rejects.toBeInstanceOf(CheckoutReturnUrlInvalidException);
    });
  });

  describe('applyCheckoutCompleted', () => {
    it('upgrades the matching user to the monthly plan', async () => {
      mockUserService.findUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(),
      );
      mockPlanService.getPlanBySlug.mockResolvedValue(createSamplePlan(PlanKind.MONTHLY_PAID));
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await subscriptionBillingService.applyCheckoutCompleted({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: '5',
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
      });
      expect(mockPlanService.getPlanBySlug).toHaveBeenCalledWith(PLAN_SLUG.MONTHLY);
      expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith({
        id: 7,
        planId: 2,
        status: SubscriptionStatus.ACTIVE,
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
        canceledAt: null,
      });
    });

    it('no-ops when the client reference does not match a user', async () => {
      await subscriptionBillingService.applyCheckoutCompleted({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: 'not-a-user',
        currentPeriodStart: null,
        currentPeriodEnd: null,
      });
      expect(mockUserService.findUserById).not.toHaveBeenCalled();
    });
  });

  describe('applySubscriptionCanceled', () => {
    it('cancels the local subscription when Stripe ids match', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED),
      );
      await subscriptionBillingService.applySubscriptionCanceled({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        currentPeriodEnd: null,
      });
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7);
    });

    it('no-ops when no local subscription matches the Stripe ids', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(null);
      mockSubscriptionRepository.findByStripeCustomerId.mockResolvedValue(null);
      await subscriptionBillingService.applySubscriptionCanceled({
        customerId: 'cus_missing',
        subscriptionId: 'sub_missing',
        currentPeriodEnd: null,
      });
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe('receiveWebhook', () => {
    it('rejects a missing signature or raw body', async () => {
      await expect(
        subscriptionBillingService.receiveWebhook({ payload: undefined, signature: 'sig' }),
      ).rejects.toBeInstanceOf(StripeInvalidWebhookException);
    });

    it('forwards a verified payload to the Stripe manager', async () => {
      mockStripeManagerService.processWebhook.mockResolvedValue(undefined);
      const payload = Buffer.from('{"id":"evt_1"}');
      await subscriptionBillingService.receiveWebhook({ payload, signature: 'sig' });
      expect(mockStripeManagerService.processWebhook).toHaveBeenCalledWith({
        payload,
        signature: 'sig',
      });
    });
  });
});
