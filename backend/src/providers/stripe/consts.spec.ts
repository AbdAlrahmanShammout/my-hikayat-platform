import { STRIPE_CHECKOUT } from './consts';

describe('STRIPE_CHECKOUT', () => {
  it('creates a single-item monthly subscription checkout', () => {
    expect(STRIPE_CHECKOUT.mode).toBe('subscription');
    expect(STRIPE_CHECKOUT.quantity).toBe(1);
  });
});
