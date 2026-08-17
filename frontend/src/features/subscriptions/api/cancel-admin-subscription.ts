import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Cancels a subscription without a refund. Access lasts until currentPeriodEnd.
 */
export async function cancelAdminSubscription(
  subscriptionId: number,
): Promise<components['schemas']['SubscriptionResponse']> {
  return requestJson<components['schemas']['SubscriptionResponse']>({
    path: `/admin/subscriptions/${subscriptionId}/cancel`,
    method: 'POST',
  });
}
