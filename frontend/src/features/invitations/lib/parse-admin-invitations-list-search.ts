import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminInvitationsListSearch = {
  readonly offset: number;
};

/**
 * Reads invitation list paging from the URL.
 */
export function parseAdminInvitationsListSearch(
  searchParams: URLSearchParams,
): AdminInvitationsListSearch {
  return {
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
