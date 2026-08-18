import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorCategories,
  type ListAuthorCategoriesQuery,
} from '@/features/categories/api/list-author-categories';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/categories.
 */
export function useAuthorCategoriesList(
  query: ListAuthorCategoriesQuery = {},
): UseQueryResult<components['schemas']['GetCategoriesResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.categories.list(query),
    queryFn: () => listAuthorCategories(query),
  });
}
