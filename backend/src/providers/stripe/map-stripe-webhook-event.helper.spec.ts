import { mapStripeWebhookEvent } from './map-stripe-webhook-event.helper';

describe('mapStripeWebhookEvent', () => {
  it('reads checkout session identifiers including expanded objects', () => {
    const actualEvent = mapStripeWebhookEvent({
      id: 'evt_1',
      type: 'checkout.session.completed',
      object: {
        id: 'cs_1',
        customer: { id: 'cus_1' },
        subscription: 'sub_1',
        client_reference_id: '7',
      },
    });
    expect(actualEvent).toEqual({
      id: 'evt_1',
      type: 'checkout.session.completed',
      objectId: 'cs_1',
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      clientReferenceId: '7',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      status: null,
    });
  });

  it('reads subscription periods from items when top-level fields are absent', () => {
    const actualEvent = mapStripeWebhookEvent({
      id: 'evt_2',
      type: 'customer.subscription.updated',
      object: {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'active',
        items: {
          data: [{ current_period_start: 1_700_000_000, current_period_end: 1_702_592_000 }],
        },
      },
    });
    expect(actualEvent.subscriptionId).toBe('sub_1');
    expect(actualEvent.currentPeriodStart).toEqual(new Date(1_700_000_000 * 1000));
    expect(actualEvent.currentPeriodEnd).toEqual(new Date(1_702_592_000 * 1000));
    expect(actualEvent.status).toBe('active');
  });
});
