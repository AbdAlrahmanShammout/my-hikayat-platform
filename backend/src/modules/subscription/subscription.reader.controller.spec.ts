import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { StartCheckoutResponseDto } from '@/modules/subscription/dto/response/start-checkout-response.dto';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { SubscriptionReaderController } from './subscription.reader.controller';

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

describe('SubscriptionReaderController', () => {
  let subscriptionReaderController: SubscriptionReaderController;
  let mockSubscriptionBillingService: {
    startCheckout: jest.Mock;
    renderCheckoutReturnPage: jest.Mock;
    getCurrentSubscription: jest.Mock;
    requestRefund: jest.Mock;
  };
  let mockPlanService: { listPaidCatalogPlans: jest.Mock };

  beforeEach(async () => {
    mockSubscriptionBillingService = {
      startCheckout: jest.fn(),
      renderCheckoutReturnPage: jest.fn(),
      getCurrentSubscription: jest.fn(),
      requestRefund: jest.fn(),
    };
    mockPlanService = { listPaidCatalogPlans: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [SubscriptionReaderController],
      providers: [
        { provide: SubscriptionBillingService, useValue: mockSubscriptionBillingService },
        { provide: PlanService, useValue: mockPlanService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    subscriptionReaderController = moduleRef.get(SubscriptionReaderController);
  });

  it('starts checkout from the authenticated user and return URLs', async () => {
    mockSubscriptionBillingService.startCheckout.mockResolvedValue({
      url: 'https://checkout.stripe.test/cs_1',
    });
    const actualResponse: StartCheckoutResponseDto =
      await subscriptionReaderController.startCheckout(
        {
          planId: 2,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        },
        createSampleUser(),
        {
          protocol: 'http',
          headers: {},
          get: (name: string): string | undefined =>
            name.toLowerCase() === 'host' ? 'localhost:3000' : undefined,
        } as Request,
      );
    expect(mockSubscriptionBillingService.startCheckout).toHaveBeenCalledWith({
      userId: 5,
      planId: 2,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      bridgeOrigin: 'http://localhost:3000',
    });
    expect(actualResponse.url).toBe('https://checkout.stripe.test/cs_1');
  });

  it('renders the public checkout-return page', () => {
    mockSubscriptionBillingService.renderCheckoutReturnPage.mockReturnValue(
      '<html>Returning to the app…</html>',
    );
    const actualHtml: string = subscriptionReaderController.renderCheckoutReturn({
      to: 'reader://billing/success',
    });
    expect(mockSubscriptionBillingService.renderCheckoutReturnPage).toHaveBeenCalledWith(
      'reader://billing/success',
    );
    expect(actualHtml).toContain('Returning to the app');
  });

  it('returns the current subscription projection', async () => {
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
      stripeCustomerId: 'cus_secret',
      stripeSubscriptionId: null,
      plan: undefined,
    });
    mockSubscriptionBillingService.getCurrentSubscription.mockResolvedValue(entity);
    const actualResponse =
      await subscriptionReaderController.getCurrentSubscription(createSampleUser());
    expect(actualResponse.userId).toBe(5);
    expect(actualResponse.status).toBe(SubscriptionStatus.ACTIVE);
    expect(actualResponse).not.toHaveProperty('stripeCustomerId');
  });

  it('requests a refund for the authenticated user', async () => {
    const entity = new SubscriptionEntity({
      id: 7,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 5,
      planId: 2,
      status: SubscriptionStatus.CANCELED,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
      canceledAt: new Date('2026-08-02T00:00:00.000Z'),
      activatedAt: new Date('2026-08-01T00:00:00.000Z'),
      stripeCustomerId: 'cus_secret',
      stripeSubscriptionId: 'sub_secret',
      plan: undefined,
    });
    mockSubscriptionBillingService.requestRefund.mockResolvedValue(entity);
    const actualResponse = await subscriptionReaderController.requestRefund(createSampleUser());
    expect(mockSubscriptionBillingService.requestRefund).toHaveBeenCalledWith(5);
    expect(actualResponse.status).toBe(SubscriptionStatus.CANCELED);
    expect(actualResponse).not.toHaveProperty('stripeSubscriptionId');
  });
});
