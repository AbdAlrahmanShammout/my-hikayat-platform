import * as WebBrowser from 'expo-web-browser';

import { ApiError } from '@/api/api-error';
import { startReaderCheckout } from '@/features/billing/api/start-reader-checkout';
import {
  CHECKOUT_CANCEL_URL,
  CHECKOUT_RETURN_PREFIX,
  CHECKOUT_SUCCESS_URL,
  resolveCheckoutBrowserOutcome,
  type CheckoutBrowserOutcome,
} from '@/features/billing/lib/checkout-return';

export type StartCheckoutFlowResult =
  | { readonly kind: 'success_return' }
  | { readonly kind: 'cancel_return' }
  | { readonly kind: 'dismissed' }
  | { readonly kind: 'session_failed'; readonly message: string };

/**
 * Starts Stripe-hosted Checkout in an auth session and maps the browser return.
 * Does not grant entitlement — callers must refetch subscription from the backend.
 */
export async function executeStripeCheckoutFlow(): Promise<StartCheckoutFlowResult> {
  let checkoutUrl: string;
  try {
    const session = await startReaderCheckout({
      successUrl: CHECKOUT_SUCCESS_URL,
      cancelUrl: CHECKOUT_CANCEL_URL,
    });
    checkoutUrl = session.url;
  } catch (error: unknown) {
    return {
      kind: 'session_failed',
      message: mapCheckoutStartError(error),
    };
  }
  const browserResult = await WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    CHECKOUT_RETURN_PREFIX,
  );
  const outcome: CheckoutBrowserOutcome = resolveCheckoutBrowserOutcome({
    resultType: browserResult.type,
    url: 'url' in browserResult ? browserResult.url : null,
  });
  if (outcome.kind === 'success') {
    return { kind: 'success_return' };
  }
  if (outcome.kind === 'cancel') {
    return { kind: 'cancel_return' };
  }
  if (outcome.kind === 'dismissed') {
    return { kind: 'dismissed' };
  }
  return { kind: 'dismissed' };
}

function mapCheckoutStartError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'SUBSCRIPTION_ALREADY_PAID') {
      return 'This plan is already active. Full-book reading follows the server.';
    }
    if (error.code === 'CHECKOUT_RETURN_URL_INVALID') {
      return 'Checkout return links are not configured correctly.';
    }
    if (error.message.trim().length > 0) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Could not start checkout right now.';
}
