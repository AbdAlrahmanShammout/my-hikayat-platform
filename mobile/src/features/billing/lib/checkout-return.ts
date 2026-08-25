export const CHECKOUT_RETURN_SCHEME = 'reader';
export const CHECKOUT_RETURN_PREFIX = 'reader://billing';
export const CHECKOUT_SUCCESS_URL = 'reader://billing/success';
export const CHECKOUT_CANCEL_URL = 'reader://billing/cancel';

export type CheckoutBrowserOutcome =
  | { readonly kind: 'success' }
  | { readonly kind: 'cancel' }
  | { readonly kind: 'dismissed' }
  | { readonly kind: 'unknown'; readonly url: string | null };

/**
 * Maps an auth-session result URL to a checkout outcome.
 * Entitlement is never inferred here — callers must refetch the backend subscription.
 */
export function resolveCheckoutBrowserOutcome(input: {
  readonly resultType: string;
  readonly url: string | null | undefined;
}): CheckoutBrowserOutcome {
  if (input.resultType === 'cancel' || input.resultType === 'dismiss') {
    return { kind: 'dismissed' };
  }
  const url: string | null =
    typeof input.url === 'string' && input.url.trim().length > 0 ? input.url.trim() : null;
  if (url === null) {
    return { kind: 'unknown', url: null };
  }
  if (url.startsWith(CHECKOUT_SUCCESS_URL)) {
    return { kind: 'success' };
  }
  if (url.startsWith(CHECKOUT_CANCEL_URL)) {
    return { kind: 'cancel' };
  }
  if (url.startsWith(CHECKOUT_RETURN_PREFIX)) {
    return { kind: 'unknown', url };
  }
  return { kind: 'unknown', url };
}
