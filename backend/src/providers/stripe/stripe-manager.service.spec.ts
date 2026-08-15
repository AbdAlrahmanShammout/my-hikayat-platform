import { StripeConfigService } from '@/config/stripe/stripe-config.service';
import { StripeFailureException } from '@/providers/stripe/exceptions/stripe-failure.exception';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeNotInitializedException } from '@/providers/stripe/exceptions/stripe-not-initialized.exception';

import { StripeManagerService } from './stripe-manager.service';

describe('StripeManagerService', () => {
  const mockStripeConfigService = {
    priceId: 'price_test_monthly',
    webhookSecret: 'whsec_test_secret',
  };
  let mockStripe: {
    customers: { create: jest.Mock };
    checkout: { sessions: { create: jest.Mock } };
    subscriptions: { retrieve: jest.Mock; cancel: jest.Mock };
    invoices: { list: jest.Mock };
    refunds: { create: jest.Mock };
    webhooks: { constructEvent: jest.Mock };
  };
  let stripeManagerService: StripeManagerService;

  beforeEach(() => {
    mockStripe = {
      customers: { create: jest.fn() },
      checkout: { sessions: { create: jest.fn() } },
      subscriptions: { retrieve: jest.fn(), cancel: jest.fn() },
      invoices: { list: jest.fn() },
      refunds: { create: jest.fn() },
      webhooks: { constructEvent: jest.fn() },
    };
    stripeManagerService = new StripeManagerService(
      mockStripe as never,
      mockStripeConfigService as unknown as StripeConfigService,
    );
  });

  describe('createCustomer', () => {
    it('creates a Stripe customer from email and client reference', async () => {
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_test_1' });
      const actualCustomer = await stripeManagerService.createCustomer({
        email: 'reader@example.com',
        clientReferenceId: '7',
      });
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'reader@example.com',
        metadata: { clientReferenceId: '7' },
      });
      expect(actualCustomer).toEqual({ customerId: 'cus_test_1' });
    });

    it('wraps Stripe customer failures', async () => {
      mockStripe.customers.create.mockRejectedValue(new Error('network'));
      await expect(
        stripeManagerService.createCustomer({
          email: 'reader@example.com',
          clientReferenceId: '7',
        }),
      ).rejects.toBeInstanceOf(StripeFailureException);
    });
  });

  describe('createCheckoutSession', () => {
    it('creates a hosted checkout session for the configured monthly price', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_1',
        url: 'https://checkout.stripe.test/cs_test_1',
      });
      const actualSession = await stripeManagerService.createCheckoutSession({
        customerId: 'cus_test_1',
        successUrl: 'https://app.test/success',
        cancelUrl: 'https://app.test/cancel',
        clientReferenceId: '7',
      });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer: 'cus_test_1',
        client_reference_id: '7',
        success_url: 'https://app.test/success',
        cancel_url: 'https://app.test/cancel',
        line_items: [{ price: 'price_test_monthly', quantity: 1 }],
      });
      expect(actualSession).toEqual({
        checkoutSessionId: 'cs_test_1',
        url: 'https://checkout.stripe.test/cs_test_1',
      });
    });

    it('rejects a checkout session that has no hosted url', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({ id: 'cs_test_1', url: null });
      await expect(
        stripeManagerService.createCheckoutSession({
          customerId: 'cus_test_1',
          successUrl: 'https://app.test/success',
          cancelUrl: 'https://app.test/cancel',
          clientReferenceId: '7',
        }),
      ).rejects.toBeInstanceOf(StripeFailureException);
    });
  });

  describe('constructWebhookEvent', () => {
    it('maps a verified Stripe event into a provider-owned shape', () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_test_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_1',
            customer: 'cus_test_1',
            subscription: 'sub_test_1',
            client_reference_id: '7',
          },
        },
      });
      const actualEvent = stripeManagerService.constructWebhookEvent({
        payload: '{"id":"evt_test_1"}',
        signature: 't=1,v1=sig',
      });
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        '{"id":"evt_test_1"}',
        't=1,v1=sig',
        'whsec_test_secret',
      );
      expect(actualEvent).toEqual({
        id: 'evt_test_1',
        type: 'checkout.session.completed',
        objectId: 'cs_test_1',
        customerId: 'cus_test_1',
        subscriptionId: 'sub_test_1',
        clientReferenceId: '7',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: null,
      });
    });

    it('rejects an invalid webhook signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      expect(() =>
        stripeManagerService.constructWebhookEvent({
          payload: '{"id":"evt_test_1"}',
          signature: 'bad',
        }),
      ).toThrow(StripeInvalidWebhookException);
    });
  });

  describe('processWebhook', () => {
    it('rejects processing before handlers are registered', async () => {
      await expect(
        stripeManagerService.processWebhook({
          payload: '{"id":"evt_test_1"}',
          signature: 't=1,v1=sig',
        }),
      ).rejects.toBeInstanceOf(StripeNotInitializedException);
    });

    it('retrieves missing checkout periods then dispatches completion', async () => {
      const mockHandleCheckoutCompleted: jest.Mock = jest.fn().mockResolvedValue(undefined);
      const mockEventHandlers = {
        handleCheckoutCompleted: mockHandleCheckoutCompleted,
        handleSubscriptionRenewed: jest.fn().mockResolvedValue(undefined),
        handleSubscriptionCanceled: jest.fn().mockResolvedValue(undefined),
      };
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_test_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_1',
            customer: 'cus_test_1',
            subscription: 'sub_test_1',
            client_reference_id: '7',
          },
        },
      });
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_test_1',
        customer: 'cus_test_1',
        status: 'active',
        current_period_start: 1_700_000_000,
        current_period_end: 1_702_592_000,
      });
      await stripeManagerService.initialize(mockEventHandlers);
      await stripeManagerService.processWebhook({
        payload: '{"id":"evt_test_1"}',
        signature: 't=1,v1=sig',
      });
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_test_1');
      expect(mockHandleCheckoutCompleted).toHaveBeenCalledWith({
        customerId: 'cus_test_1',
        subscriptionId: 'sub_test_1',
        clientReferenceId: '7',
        currentPeriodStart: new Date(1_700_000_000 * 1000),
        currentPeriodEnd: new Date(1_702_592_000 * 1000),
      });
    });
  });

  describe('refundPaidSubscription', () => {
    it('refunds the latest paid invoice and cancels the Stripe subscription', async () => {
      mockStripe.invoices.list.mockResolvedValue({
        data: [{ payment_intent: 'pi_test_1' }],
      });
      mockStripe.refunds.create.mockResolvedValue({ id: 're_test_1' });
      mockStripe.subscriptions.cancel.mockResolvedValue({ id: 'sub_test_1' });
      const actualRefund = await stripeManagerService.refundPaidSubscription({
        stripeSubscriptionId: 'sub_test_1',
      });
      expect(mockStripe.invoices.list).toHaveBeenCalledWith({
        subscription: 'sub_test_1',
        status: 'paid',
        limit: 1,
      });
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({ payment_intent: 'pi_test_1' });
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_test_1');
      expect(actualRefund).toEqual({ refundId: 're_test_1' });
    });

    it('wraps a missing paid invoice as a Stripe failure', async () => {
      mockStripe.invoices.list.mockResolvedValue({ data: [] });
      await expect(
        stripeManagerService.refundPaidSubscription({ stripeSubscriptionId: 'sub_test_1' }),
      ).rejects.toBeInstanceOf(StripeFailureException);
    });
  });

  describe('cancelPaidSubscription', () => {
    it('cancels the Stripe subscription without issuing a refund', async () => {
      mockStripe.subscriptions.cancel.mockResolvedValue({ id: 'sub_test_1' });
      await stripeManagerService.cancelPaidSubscription({ stripeSubscriptionId: 'sub_test_1' });
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_test_1');
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it('wraps a Stripe cancel failure', async () => {
      mockStripe.subscriptions.cancel.mockRejectedValue(new Error('stripe down'));
      await expect(
        stripeManagerService.cancelPaidSubscription({ stripeSubscriptionId: 'sub_test_1' }),
      ).rejects.toBeInstanceOf(StripeFailureException);
    });
  });
});
