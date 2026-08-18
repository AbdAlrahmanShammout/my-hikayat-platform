import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AuthorBookRejectionHistorySearch = {
  readonly offset: number;
};

/**
 * Reads rejection-history paging from the book detail URL.
 */
export function parseAuthorBookRejectionHistorySearch(
  searchParams: URLSearchParams,
): AuthorBookRejectionHistorySearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('rejectionOffset') ?? undefined) ?? 0,
  };
}
