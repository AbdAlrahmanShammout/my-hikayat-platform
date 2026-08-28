import { CHECKOUT_RETURN_PATH } from './checkout-return-path.constant';

describe('CHECKOUT_RETURN_PATH', () => {
  it('matches the public reader billing checkout-return route', () => {
    expect(CHECKOUT_RETURN_PATH).toBe('/reader/billing/checkout-return');
  });
});
