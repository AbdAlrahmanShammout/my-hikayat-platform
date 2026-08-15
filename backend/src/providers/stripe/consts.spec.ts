import { STRIPE } from './consts';

describe('STRIPE', () => {
  it('creates a single-item monthly subscription checkout', () => {
    expect(STRIPE.checkout.mode).toBe('subscription');
    expect(STRIPE.checkout.quantity).toBe(1);
  });

  it('names the inbound webhook events the manager dispatches', () => {
    expect(STRIPE.webhookEventType.checkoutSessionCompleted).toBe('checkout.session.completed');
    expect(STRIPE.webhookEventType.customerSubscriptionUpdated).toBe(
      'customer.subscription.updated',
    );
    expect(STRIPE.webhookEventType.customerSubscriptionDeleted).toBe(
      'customer.subscription.deleted',
    );
    expect(STRIPE.canceledStatuses).toEqual(['canceled', 'unpaid', 'incomplete_expired']);
  });
});
