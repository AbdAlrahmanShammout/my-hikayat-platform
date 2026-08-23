import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listReaderCategories,
  type GetCategoriesResponse,
} from '@/features/catalog/api/list-reader-categories';

const DEFAULT_CATEGORY_LIMIT = 50;

/**
 * Loads categories for catalog filter chips.
 */
export function useReaderCategories() {
  return useQuery<GetCategoriesResponse>({
    queryKey: queryKeys.catalog.categories({ limit: DEFAULT_CATEGORY_LIMIT, offset: 0 }),
    queryFn: () => listReaderCategories({ limit: DEFAULT_CATEGORY_LIMIT, offset: 0 }),
  });
}
