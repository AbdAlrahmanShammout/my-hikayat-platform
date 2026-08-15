import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeNotInitializedException } from '@/providers/stripe/exceptions/stripe-not-initialized.exception';

import { MemoryStripeManagerService } from './memory-stripe-manager.service';

describe('MemoryStripeManagerService', () => {
  let memoryStripeManagerService: MemoryStripeManagerService;

  beforeEach(() => {
    memoryStripeManagerService = new MemoryStripeManagerService();
  });

  it('returns deterministic customer and checkout session identifiers', async () => {
    const actualCustomer = await memoryStripeManagerService.createCustomer({
      email: 'reader@example.com',
      clientReferenceId: '7',
    });
    const actualSession = await memoryStripeManagerService.createCheckoutSession({
      customerId: actualCustomer.customerId,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      clientReferenceId: '7',
    });
    expect(actualCustomer).toEqual({ customerId: 'cus_memory_7' });
    expect(actualSession).toEqual({
      checkoutSessionId: 'cs_memory_7',
      url: 'https://checkout.stripe.test/cs_memory_7',
    });
  });

  it('parses a Stripe-like JSON payload without verifying a signature', () => {
    const actualEvent = memoryStripeManagerService.constructWebhookEvent({
      payload: JSON.stringify({
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_memory_7',
            customer: 'cus_memory_7',
            subscription: 'sub_memory_7',
            client_reference_id: '7',
          },
        },
      }),
      signature: 'ignored',
    });
    expect(actualEvent.clientReferenceId).toBe('7');
    expect(actualEvent.subscriptionId).toBe('sub_memory_7');
  });

  it('rejects malformed webhook payloads', () => {
    expect(() =>
      memoryStripeManagerService.constructWebhookEvent({
        payload: '{not-json',
        signature: 'ignored',
      }),
    ).toThrow(StripeInvalidWebhookException);
  });

  it('dispatches a parsed checkout event after initialize', async () => {
    const mockHandleCheckoutCompleted: jest.Mock = jest.fn().mockResolvedValue(undefined);
    const mockEventHandlers = {
      handleCheckoutCompleted: mockHandleCheckoutCompleted,
      handleSubscriptionRenewed: jest.fn().mockResolvedValue(undefined),
      handleSubscriptionCanceled: jest.fn().mockResolvedValue(undefined),
    };
    await memoryStripeManagerService.initialize(mockEventHandlers);
    await memoryStripeManagerService.processWebhook({
      payload: JSON.stringify({
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_memory_7',
            customer: 'cus_memory_7',
            subscription: 'sub_memory_7',
            client_reference_id: '7',
          },
        },
      }),
      signature: 'ignored',
    });
    expect(mockHandleCheckoutCompleted).toHaveBeenCalledWith({
      customerId: 'cus_memory_7',
      subscriptionId: 'sub_memory_7',
      clientReferenceId: '7',
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });
  });

  it('rejects processing before handlers are registered', async () => {
    await expect(
      memoryStripeManagerService.processWebhook({
        payload: JSON.stringify({ id: 'evt_1', type: 'invoice.paid', data: { object: {} } }),
        signature: 'ignored',
      }),
    ).rejects.toBeInstanceOf(StripeNotInitializedException);
  });

  it('returns a deterministic refund identifier', async () => {
    const actualRefund = await memoryStripeManagerService.refundPaidSubscription({
      stripeSubscriptionId: 'sub_memory_7',
    });
    expect(actualRefund).toEqual({ refundId: 're_memory_sub_memory_7' });
  });

  it('cancels a paid Stripe subscription without a refund identifier', async () => {
    await expect(
      memoryStripeManagerService.cancelPaidSubscription({ stripeSubscriptionId: 'sub_memory_7' }),
    ).resolves.toBeUndefined();
  });
});
