import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { AdminInvitationListStatus } from '@/modules/user/enum/admin-invitation-status.enum';

export type CreateAdminInvitationRepoInput = {
  readonly email: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly invitedByUserId: number;
  readonly lastSentAt: Date;
};

export type ListAdminInvitationsRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly now: Date;
  readonly status?: AdminInvitationListStatus;
  readonly email?: string;
};

export type ReplaceAdminInvitationDeliveryRepoInput = {
  readonly id: number;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly lastSentAt: Date | null;
  readonly resendCount: number;
};

export type RevokeAdminInvitationRepoInput = {
  readonly id: number;
  readonly revokedAt: Date;
  readonly revokedByUserId: number;
  readonly revokeReason: string | null;
};

export type AcceptAdminInvitationRepoInput = {
  readonly id: number;
  readonly acceptedAt: Date;
};

export type AdminInvitationPage = {
  readonly entities: AdminInvitationEntity[];
  readonly total: number;
};
