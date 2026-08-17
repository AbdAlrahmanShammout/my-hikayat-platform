import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one subscription for administrative management.
 */
export async function getAdminSubscription(
  subscriptionId: number,
): Promise<components['schemas']['SubscriptionResponse']> {
  return requestJson<components['schemas']['SubscriptionResponse']>({
    path: `/admin/subscriptions/${subscriptionId}`,
    method: 'GET',
  });
}
