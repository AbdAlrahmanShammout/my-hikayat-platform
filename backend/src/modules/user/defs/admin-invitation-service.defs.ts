import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { AdminInvitationListStatus } from '@/modules/user/enum/admin-invitation-status.enum';

export type CreateAdminInvitationServiceInput = {
  readonly email: string;
  readonly invitedByUserId: number;
};

export type CreateAdminInvitationServiceResult = {
  readonly invitation: AdminInvitationEntity;
  readonly token: string;
};

export type ListAdminInvitationsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly status?: AdminInvitationListStatus;
  readonly email?: string;
};

export type ResendAdminInvitationServiceInput = {
  readonly id: number;
  readonly actorUserId: number;
};

export type RevokeAdminInvitationServiceInput = {
  readonly id: number;
  readonly actorUserId: number;
  readonly reason?: string | null;
};

export type AcceptAdminInvitationServiceInput = {
  readonly token: string;
  readonly passwordHash: string;
};
