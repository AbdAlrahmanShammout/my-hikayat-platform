import { TransactionContext } from '@/common/base/transaction-context';
import {
  AcceptAdminInvitationRepoInput,
  AdminInvitationPage,
  CreateAdminInvitationRepoInput,
  ListAdminInvitationsRepoInput,
  ReplaceAdminInvitationDeliveryRepoInput,
  RevokeAdminInvitationRepoInput,
} from '@/modules/user/defs/admin-invitation-repository.defs';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';

export abstract class AdminInvitationRepository {
  abstract create(
    input: CreateAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity>;
  abstract findByTokenHash(tokenHash: string): Promise<AdminInvitationEntity | null>;
  abstract findById(id: number): Promise<AdminInvitationEntity | null>;
  abstract findPendingByEmail(email: string, now: Date): Promise<AdminInvitationEntity | null>;
  abstract list(input: ListAdminInvitationsRepoInput): Promise<AdminInvitationPage>;
  abstract replaceDelivery(
    input: ReplaceAdminInvitationDeliveryRepoInput,
  ): Promise<AdminInvitationEntity>;
  abstract revoke(input: RevokeAdminInvitationRepoInput): Promise<AdminInvitationEntity>;
  abstract markAccepted(
    input: AcceptAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity>;
  abstract delete(id: number, context?: TransactionContext): Promise<void>;
}
