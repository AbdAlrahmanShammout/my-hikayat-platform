import { isCheckoutReturnUrlAllowed } from './checkout-return-url.helper';

describe('isCheckoutReturnUrlAllowed', () => {
  it('allows http origins by exact origin match', () => {
    expect(
      isCheckoutReturnUrlAllowed('http://localhost:5173/billing/success', [
        'http://localhost:5173',
      ]),
    ).toBe(true);
  });

  it('rejects http origins outside the allowlist', () => {
    expect(
      isCheckoutReturnUrlAllowed('https://evil.test/success', ['http://localhost:5173']),
    ).toBe(false);
  });

  it('allows reader deep links when reader:// is allowlisted', () => {
    expect(
      isCheckoutReturnUrlAllowed('reader://billing/success', ['reader://']),
    ).toBe(true);
    expect(
      isCheckoutReturnUrlAllowed('reader://billing/cancel', ['reader://']),
    ).toBe(true);
  });

  it('rejects other custom schemes when only reader:// is allowlisted', () => {
    expect(isCheckoutReturnUrlAllowed('other://billing/success', ['reader://'])).toBe(
      false,
    );
  });

  it('rejects malformed URLs', () => {
    expect(isCheckoutReturnUrlAllowed('not-a-url', ['reader://'])).toBe(false);
  });
});
