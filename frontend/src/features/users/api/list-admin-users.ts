import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminUsersQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly role?: string;
  readonly excludeRole?: string;
  readonly isPublisher?: boolean;
  readonly email?: string;
  readonly q?: string;
  readonly sortBy?: 'createdAt' | 'email' | 'displayName';
  readonly sortOrder?: 'asc' | 'desc';
};

/**
 * Lists users for the admin audience. `total` is the account count.
 */
export async function listAdminUsers(
  query: ListAdminUsersQuery = {},
): Promise<components['schemas']['GetUsersResponseDto']> {
  return requestJson<components['schemas']['GetUsersResponseDto']>({
    path: `/admin/users${toSearchParams(query)}`,
    method: 'GET',
  });
}
