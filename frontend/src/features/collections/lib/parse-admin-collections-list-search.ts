import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminCollectionsListSearch = {
  readonly offset: number;
};

/**
 * Reads collection list paging from the URL.
 */
export function parseAdminCollectionsListSearch(
  searchParams: URLSearchParams,
): AdminCollectionsListSearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
