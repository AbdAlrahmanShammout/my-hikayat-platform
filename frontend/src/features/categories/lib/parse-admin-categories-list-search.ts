import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminCategoriesListSearch = {
  readonly offset: number;
};

/**
 * Reads category list paging from the URL.
 */
export function parseAdminCategoriesListSearch(
  searchParams: URLSearchParams,
): AdminCategoriesListSearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
