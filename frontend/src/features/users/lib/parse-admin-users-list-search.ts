import { parseExactEmail } from '@/lib/parse-exact-email';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminUsersListSearch = {
  readonly email: string | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Invalid email values are ignored.
 */
export function parseAdminUsersListSearch(searchParams: URLSearchParams): AdminUsersListSearch {
  return {
    email: parseExactEmail(searchParams.get('email') ?? undefined),
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
