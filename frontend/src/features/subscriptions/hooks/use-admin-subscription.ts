import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminSubscription } from '@/features/subscriptions/api/get-admin-subscription';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/subscriptions/:id.
 */
export function useAdminSubscription(
  subscriptionId: number,
): UseQueryResult<components['schemas']['SubscriptionResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.subscriptions.detail(subscriptionId),
    queryFn: () => getAdminSubscription(subscriptionId),
  });
}
