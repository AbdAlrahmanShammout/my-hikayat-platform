import { dispatchStripeWebhookEvent } from './dispatch-stripe-webhook-event.helper';

describe('dispatchStripeWebhookEvent', () => {
  let mockEventHandlers: {
    handleCheckoutCompleted: jest.Mock;
    handleSubscriptionRenewed: jest.Mock;
    handleSubscriptionCanceled: jest.Mock;
    handleInvoicePaymentFailed: jest.Mock;
  };

  beforeEach(() => {
    mockEventHandlers = {
      handleCheckoutCompleted: jest.fn().mockResolvedValue(undefined),
      handleSubscriptionRenewed: jest.fn().mockResolvedValue(undefined),
      handleSubscriptionCanceled: jest.fn().mockResolvedValue(undefined),
      handleInvoicePaymentFailed: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('dispatches checkout completion when identifiers are present', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_1',
        type: 'checkout.session.completed',
        objectId: 'cs_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: '7',
        planId: '2',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: null,
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleCheckoutCompleted).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      clientReferenceId: '7',
      planId: '2',
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });
  });

  it('ignores checkout completion when identifiers are missing', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_1',
        type: 'checkout.session.completed',
        objectId: 'cs_1',
        customerId: null,
        subscriptionId: 'sub_1',
        clientReferenceId: '7',
        planId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: null,
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleCheckoutCompleted).not.toHaveBeenCalled();
  });

  it('treats unpaid subscription updates as cancellations', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_2',
        type: 'customer.subscription.updated',
        objectId: 'sub_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: null,
        planId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: 'unpaid',
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleSubscriptionCanceled).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      currentPeriodEnd: null,
    });
    expect(mockEventHandlers.handleSubscriptionRenewed).not.toHaveBeenCalled();
  });

  it('renews active subscription updates', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_3',
        type: 'customer.subscription.updated',
        objectId: 'sub_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: null,
        planId: null,
        currentPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-02-01T00:00:00.000Z'),
        status: 'active',
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleSubscriptionRenewed).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      currentPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00.000Z'),
      status: 'active',
    });
  });

  it('renews past_due subscription updates instead of canceling them', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_past_due',
        type: 'customer.subscription.updated',
        objectId: 'sub_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: null,
        planId: null,
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
        status: 'past_due',
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleSubscriptionRenewed).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
      status: 'past_due',
    });
    expect(mockEventHandlers.handleSubscriptionCanceled).not.toHaveBeenCalled();
  });

  it('records invoice payment failures without canceling', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_pay_fail',
        type: 'invoice.payment_failed',
        objectId: 'in_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: null,
        planId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: 'open',
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleInvoicePaymentFailed).toHaveBeenCalledWith({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      invoiceId: 'in_1',
      status: 'open',
    });
    expect(mockEventHandlers.handleSubscriptionCanceled).not.toHaveBeenCalled();
    expect(mockEventHandlers.handleSubscriptionRenewed).not.toHaveBeenCalled();
  });

  it('ignores unknown event types', async () => {
    await dispatchStripeWebhookEvent({
      event: {
        id: 'evt_4',
        type: 'invoice.paid',
        objectId: 'in_1',
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: null,
        planId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        status: null,
      },
      eventHandlers: mockEventHandlers,
    });
    expect(mockEventHandlers.handleCheckoutCompleted).not.toHaveBeenCalled();
    expect(mockEventHandlers.handleSubscriptionRenewed).not.toHaveBeenCalled();
    expect(mockEventHandlers.handleSubscriptionCanceled).not.toHaveBeenCalled();
    expect(mockEventHandlers.handleInvoicePaymentFailed).not.toHaveBeenCalled();
  });
});
