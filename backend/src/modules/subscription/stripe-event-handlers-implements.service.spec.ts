import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

import { StripeEventHandlersImplementsService } from './stripe-event-handlers-implements.service';

describe('StripeEventHandlersImplementsService', () => {
  let mockStripeManagerService: { initialize: jest.Mock };
  let mockSubscriptionBillingService: {
    applyCheckoutCompleted: jest.Mock;
    applySubscriptionRenewed: jest.Mock;
    applySubscriptionCanceled: jest.Mock;
  };
  let stripeEventHandlersImplementsService: StripeEventHandlersImplementsService;

  beforeEach(() => {
    mockStripeManagerService = { initialize: jest.fn() };
    mockSubscriptionBillingService = {
      applyCheckoutCompleted: jest.fn(),
      applySubscriptionRenewed: jest.fn(),
      applySubscriptionCanceled: jest.fn(),
    };
    stripeEventHandlersImplementsService = new StripeEventHandlersImplementsService(
      mockStripeManagerService as unknown as StripeManagerService,
      mockSubscriptionBillingService as unknown as SubscriptionBillingService,
    );
  });

  it('registers itself with the Stripe manager on module init', async () => {
    await stripeEventHandlersImplementsService.onModuleInit();
    expect(mockStripeManagerService.initialize).toHaveBeenCalledWith(
      stripeEventHandlersImplementsService,
    );
  });

  it('forwards checkout completion to billing', async () => {
    mockSubscriptionBillingService.applyCheckoutCompleted.mockResolvedValue(undefined);
    await stripeEventHandlersImplementsService.handleCheckoutCompleted({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      clientReferenceId: '5',
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });
    expect(mockSubscriptionBillingService.applyCheckoutCompleted).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      clientReferenceId: '5',
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });
  });
});
