import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminSubscriptions,
  type ListAdminSubscriptionsQuery,
} from '@/features/subscriptions/api/list-admin-subscriptions';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/subscriptions.
 */
export function useAdminSubscriptionsList(
  query: ListAdminSubscriptionsQuery = {},
): UseQueryResult<components['schemas']['GetSubscriptionsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.subscriptions.list(query),
    queryFn: () => listAdminSubscriptions(query),
  });
}
