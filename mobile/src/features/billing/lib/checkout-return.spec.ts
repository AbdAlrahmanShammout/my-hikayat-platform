import {
  CHECKOUT_CANCEL_URL,
  CHECKOUT_RETURN_PREFIX,
  CHECKOUT_SUCCESS_URL,
  resolveCheckoutBrowserOutcome,
} from '@/features/billing/lib/checkout-return';

describe('resolveCheckoutBrowserOutcome', () => {
  it('maps success and cancel deep links', () => {
    expect(
      resolveCheckoutBrowserOutcome({
        resultType: 'success',
        url: CHECKOUT_SUCCESS_URL,
      }),
    ).toEqual({ kind: 'success' });
    expect(
      resolveCheckoutBrowserOutcome({
        resultType: 'success',
        url: CHECKOUT_CANCEL_URL,
      }),
    ).toEqual({ kind: 'cancel' });
  });

  it('maps browser dismiss/cancel without granting entitlement', () => {
    expect(
      resolveCheckoutBrowserOutcome({
        resultType: 'cancel',
        url: null,
      }),
    ).toEqual({ kind: 'dismissed' });
  });

  it('keeps unknown return URLs explicit', () => {
    expect(
      resolveCheckoutBrowserOutcome({
        resultType: 'success',
        url: `${CHECKOUT_RETURN_PREFIX}/other`,
      }),
    ).toEqual({ kind: 'unknown', url: `${CHECKOUT_RETURN_PREFIX}/other` });
  });
});
