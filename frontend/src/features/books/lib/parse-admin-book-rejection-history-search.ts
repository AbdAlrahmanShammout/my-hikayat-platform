import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminBookRejectionHistorySearch = {
  readonly offset: number;
};

/**
 * Reads rejection-history paging from the book detail URL.
 */
export function parseAdminBookRejectionHistorySearch(
  searchParams: URLSearchParams,
): AdminBookRejectionHistorySearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('rejectionOffset') ?? undefined) ?? 0,
  };
}
