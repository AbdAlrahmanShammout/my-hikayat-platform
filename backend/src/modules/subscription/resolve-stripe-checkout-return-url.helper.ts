import { CHECKOUT_RETURN_PATH } from '@/modules/subscription/consts/checkout-return-path.constant';
import { CheckoutReturnUrlInvalidException } from '@/modules/subscription/exceptions/checkout-return-url-invalid.exception';

type ResolveStripeCheckoutReturnUrlInput = {
  readonly clientReturnUrl: string;
  readonly bridgeOrigin: string;
};

/**
 * Maps a client return URL to a Stripe-accepted http(s) URL.
 * Custom schemes such as `reader://` are bridged through the public checkout-return page.
 */
export function resolveStripeCheckoutReturnUrl(input: ResolveStripeCheckoutReturnUrlInput): string {
  const parsed: URL = parseAbsoluteUrl(input.clientReturnUrl);
  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    return input.clientReturnUrl;
  }
  const origin: URL = parseAbsoluteUrl(input.bridgeOrigin);
  if (origin.protocol !== 'http:' && origin.protocol !== 'https:') {
    throw new CheckoutReturnUrlInvalidException();
  }
  const bridge: URL = new URL(CHECKOUT_RETURN_PATH, origin.origin);
  bridge.searchParams.set('to', input.clientReturnUrl);
  return bridge.toString();
}

function parseAbsoluteUrl(urlValue: string): URL {
  try {
    return new URL(urlValue);
  } catch {
    throw new CheckoutReturnUrlInvalidException();
  }
}
