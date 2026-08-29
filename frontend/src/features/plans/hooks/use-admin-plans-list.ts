import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { listAdminPlans, type ListAdminPlansQuery } from '@/features/plans/api/list-admin-plans';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/plans.
 */
export function useAdminPlansList(
  query: ListAdminPlansQuery = {},
): UseQueryResult<components['schemas']['GetPlansResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.plans.list(query),
    queryFn: () => listAdminPlans(query),
  });
}
