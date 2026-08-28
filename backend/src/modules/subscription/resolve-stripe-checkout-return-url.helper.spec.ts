import { CheckoutReturnUrlInvalidException } from '@/modules/subscription/exceptions/checkout-return-url-invalid.exception';

import { resolveStripeCheckoutReturnUrl } from './resolve-stripe-checkout-return-url.helper';

describe('resolveStripeCheckoutReturnUrl', () => {
  it('passes http return URLs through to Stripe', () => {
    const actualUrl: string = resolveStripeCheckoutReturnUrl({
      clientReturnUrl: 'http://localhost:3000/success',
      bridgeOrigin: 'http://54.225.86.205',
    });
    expect(actualUrl).toBe('http://localhost:3000/success');
  });

  it('bridges custom-scheme return URLs through the public checkout-return page', () => {
    const actualUrl: string = resolveStripeCheckoutReturnUrl({
      clientReturnUrl: 'reader://billing/success',
      bridgeOrigin: 'http://54.225.86.205',
    });
    expect(actualUrl).toBe(
      'http://54.225.86.205/reader/billing/checkout-return?to=reader%3A%2F%2Fbilling%2Fsuccess',
    );
  });

  it('rejects a bridge origin that is not http or https', () => {
    expect(() =>
      resolveStripeCheckoutReturnUrl({
        clientReturnUrl: 'reader://billing/success',
        bridgeOrigin: 'ftp://files.example',
      }),
    ).toThrow(CheckoutReturnUrlInvalidException);
  });
});
