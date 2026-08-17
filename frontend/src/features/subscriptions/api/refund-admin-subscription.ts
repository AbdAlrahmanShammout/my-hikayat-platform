import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Refunds a subscription using the same 7-day policy as the reader refund.
 */
export async function refundAdminSubscription(
  subscriptionId: number,
): Promise<components['schemas']['SubscriptionResponse']> {
  return requestJson<components['schemas']['SubscriptionResponse']>({
    path: `/admin/subscriptions/${subscriptionId}/refund`,
    method: 'POST',
  });
}
