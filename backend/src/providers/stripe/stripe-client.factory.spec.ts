import { StripeConfigService } from '@/config/stripe/stripe-config.service';

import { createStripeClient } from './stripe-client.factory';

describe('createStripeClient', () => {
  it('builds a Stripe client from the configured secret key', () => {
    const inputConfig = { secretKey: 'sk_test_not_for_production' };
    const actualClient = createStripeClient(inputConfig as unknown as StripeConfigService);
    expect(typeof actualClient.customers.create).toBe('function');
    expect(typeof actualClient.checkout.sessions.create).toBe('function');
    expect(typeof actualClient.webhooks.constructEvent).toBe('function');
  });
});
