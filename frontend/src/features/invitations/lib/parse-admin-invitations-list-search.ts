import type { AdminInvitationListStatus } from '@/features/invitations/api/admin-invitation-record';
import { parseExactEmail } from '@/lib/parse-exact-email';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

const INVITATION_STATUSES = ['pending', 'expired', 'accepted', 'revoked'] as const;

export type AdminInvitationsListSearch = {
  readonly status: AdminInvitationListStatus | undefined;
  readonly email: string | undefined;
  readonly offset: number;
};

/**
 * Reads invitation list filters from the URL. Unknown statuses are ignored.
 */
export function parseAdminInvitationsListSearch(
  searchParams: URLSearchParams,
): AdminInvitationsListSearch {
  const status: string | null = searchParams.get('status');
  return {
    status: isInvitationStatus(status) ? status : undefined,
    email: parseExactEmail(searchParams.get('email') ?? undefined),
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

/**
 * Writes invitation list filters. Pending is omitted because it is the API default.
 */
export function buildAdminInvitationsListSearch(
  search: AdminInvitationsListSearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.status !== undefined && search.status !== 'pending') {
    params.set('status', search.status);
  }
  if (search.email !== undefined) {
    params.set('email', search.email);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}

function isInvitationStatus(value: string | null): value is AdminInvitationListStatus {
  return INVITATION_STATUSES.some((status) => status === value);
}
