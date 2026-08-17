import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';

export type CreateAdminInvitationRepoInput = {
  readonly email: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly invitedByUserId: number;
};

export type ListPendingAdminInvitationsRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly now: Date;
};

export type AcceptAdminInvitationRepoInput = {
  readonly id: number;
  readonly acceptedAt: Date;
};

export type AdminInvitationPage = {
  readonly entities: AdminInvitationEntity[];
  readonly total: number;
};
