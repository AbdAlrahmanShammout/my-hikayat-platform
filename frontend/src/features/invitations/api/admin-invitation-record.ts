import type { components } from '@/generated/admin';

export type AdminInvitationStatus = 'pending' | 'accepted' | 'revoked';

export type AdminInvitationListStatus = AdminInvitationStatus | 'expired';

/**
 * Invitation row returned by the admin list, resend, and revoke endpoints.
 * The raw accept token is never included.
 */
export type AdminInvitationRecord = {
  readonly id: number;
  readonly email: string;
  readonly status: AdminInvitationStatus;
  readonly expiresAt: string;
  readonly invitedByUserId: number;
  readonly acceptedAt?: string | null;
  readonly lastSentAt?: string | null;
  readonly resendCount?: number;
  readonly revokedAt?: string | null;
  readonly revokedByUserId?: number | null;
  readonly revokeReason?: string | null;
  readonly invitedBy?: components['schemas']['UserResponse'];
};

export type AdminInvitationsPage = {
  readonly invitations: readonly AdminInvitationRecord[];
  readonly total: number;
};

export type ListAdminInvitationsQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly status?: AdminInvitationListStatus;
  readonly email?: string;
};
