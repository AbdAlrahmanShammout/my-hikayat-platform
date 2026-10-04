import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getAdminSubscriptionSupportContext,
  type SubscriptionSupportContext,
} from '@/features/subscriptions/api/get-admin-subscription-support-context';

/**
 * Server-state hook for GET /admin/subscriptions/:id/support-context.
 */
export function useAdminSubscriptionSupportContext(
  subscriptionId: number,
): UseQueryResult<SubscriptionSupportContext, Error> {
  return useQuery({
    queryKey: queryKeys.admin.subscriptions.supportContext(subscriptionId),
    queryFn: () => getAdminSubscriptionSupportContext(subscriptionId),
  });
}
