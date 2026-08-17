import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminCategories,
  type ListAdminCategoriesQuery,
} from '@/features/categories/api/list-admin-categories';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/categories.
 */
export function useAdminCategoriesList(
  query: ListAdminCategoriesQuery = {},
): UseQueryResult<components['schemas']['GetCategoriesResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.categories.list(query),
    queryFn: () => listAdminCategories(query),
  });
}
