import { parseExactEmail } from '@/lib/parse-exact-email';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export const ADMIN_USER_SORT_FIELDS = ['createdAt', 'email', 'displayName'] as const;

export type AdminUserSortField = (typeof ADMIN_USER_SORT_FIELDS)[number];

export type AdminUsersListSearch = {
  readonly email: string | undefined;
  readonly q: string | undefined;
  readonly isPublisher: boolean | undefined;
  readonly sortBy: AdminUserSortField | undefined;
  readonly sortOrder: 'asc' | 'desc' | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Invalid email and short keywords are ignored.
 */
export function parseAdminUsersListSearch(searchParams: URLSearchParams): AdminUsersListSearch {
  const sortBy: string | null = searchParams.get('sortBy');
  const sortOrder: string | null = searchParams.get('sortOrder');
  return {
    email: parseExactEmail(searchParams.get('email') ?? undefined),
    q: parseKeyword(searchParams.get('q')),
    isPublisher: parsePublisher(searchParams.get('isPublisher')),
    sortBy: isUserSortField(sortBy) ? sortBy : undefined,
    sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseKeyword(value: string | null): string | undefined {
  const trimmed: string = value?.trim() ?? '';
  return trimmed.length >= 2 ? trimmed : undefined;
}

function parsePublisher(value: string | null): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function isUserSortField(value: string | null): value is AdminUserSortField {
  return ADMIN_USER_SORT_FIELDS.some((field) => field === value);
}
