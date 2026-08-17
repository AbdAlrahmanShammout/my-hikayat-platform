import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminRevenuePeriodsListSearch = {
  readonly offset: number;
};

/**
 * Reads revenue-period list paging from the URL.
 */
export function parseAdminRevenuePeriodsListSearch(
  searchParams: URLSearchParams,
): AdminRevenuePeriodsListSearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
