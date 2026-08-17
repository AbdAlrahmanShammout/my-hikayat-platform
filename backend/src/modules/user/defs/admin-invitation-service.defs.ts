import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';

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
};

export type AcceptAdminInvitationServiceInput = {
  readonly token: string;
  readonly passwordHash: string;
};
