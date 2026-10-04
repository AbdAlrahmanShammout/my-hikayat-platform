import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminPublishers,
  type AdminPublishersPage,
  type ListAdminPublishersQuery,
} from '@/features/publishers/api/list-admin-publishers';

/**
 * Server-state hook for GET /admin/publishers.
 */
export function useAdminPublishersList(
  query: ListAdminPublishersQuery = {},
): UseQueryResult<AdminPublishersPage, Error> {
  return useQuery({
    queryKey: queryKeys.admin.publishers.list(query),
    queryFn: () => listAdminPublishers(query),
  });
}
