import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type StartCheckoutRequest = components['schemas']['StartCheckoutRequestDto'];
export type StartCheckoutResponse = components['schemas']['StartCheckoutResponseDto'];

/**
 * Starts Stripe-hosted Checkout. Backend validates return URLs and creates the session.
 */
export async function startReaderCheckout(
  body: StartCheckoutRequest,
): Promise<StartCheckoutResponse> {
  return requestJson<StartCheckoutResponse>({
    path: '/reader/billing/checkout',
    method: 'POST',
    body,
  });
}
