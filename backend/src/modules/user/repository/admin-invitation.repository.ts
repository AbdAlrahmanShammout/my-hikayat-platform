import { TransactionContext } from '@/common/base/transaction-context';
import {
  AcceptAdminInvitationRepoInput,
  AdminInvitationPage,
  CreateAdminInvitationRepoInput,
  ListPendingAdminInvitationsRepoInput,
} from '@/modules/user/defs/admin-invitation-repository.defs';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';

export abstract class AdminInvitationRepository {
  abstract create(
    input: CreateAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity>;
  abstract findByTokenHash(tokenHash: string): Promise<AdminInvitationEntity | null>;
  abstract findPendingByEmail(email: string, now: Date): Promise<AdminInvitationEntity | null>;
  abstract listPending(input: ListPendingAdminInvitationsRepoInput): Promise<AdminInvitationPage>;
  abstract markAccepted(
    input: AcceptAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity>;
}
