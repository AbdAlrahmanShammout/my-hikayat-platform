import { parseExactEmail } from '@/lib/parse-exact-email';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

export type AdminUsersListSearch = {
  readonly role: UserRole | undefined;
  readonly isPublisher: boolean | undefined;
  readonly email: string | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Invalid email or role values are ignored.
 */
export function parseAdminUsersListSearch(searchParams: URLSearchParams): AdminUsersListSearch {
  return {
    role: parseRoleFilter(searchParams.get('role') ?? undefined),
    isPublisher: parseOptionalBoolean(searchParams.get('isPublisher') ?? undefined),
    email: parseExactEmail(searchParams.get('email') ?? undefined),
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseRoleFilter(value: string | undefined): UserRole | undefined {
  if (value === USER_ROLES.READER || value === USER_ROLES.AUTHOR || value === USER_ROLES.ADMIN) {
    return value;
  }
  return undefined;
}

function parseOptionalBoolean(value: string | undefined): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}
