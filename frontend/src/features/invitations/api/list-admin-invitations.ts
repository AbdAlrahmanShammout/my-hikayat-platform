import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminInvitationsQuery = NonNullable<
  paths['/admin/invitations']['get']['parameters']['query']
>;

/**
 * Lists pending unexpired admin invitations.
 */
export async function listAdminInvitations(
  query: ListAdminInvitationsQuery = {},
): Promise<components['schemas']['GetAdminInvitationsResponseDto']> {
  return requestJson<components['schemas']['GetAdminInvitationsResponseDto']>({
    path: `/admin/invitations${toSearchParams(query)}`,
    method: 'GET',
  });
}
