import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ADMIN_INVITATION_WINDOW } from '@/modules/user/consts/admin-invitation.constant';
import { AdminInvitationPage } from '@/modules/user/defs/admin-invitation-repository.defs';
import {
  AcceptAdminInvitationServiceInput,
  CreateAdminInvitationServiceInput,
  CreateAdminInvitationServiceResult,
  ListAdminInvitationsServiceInput,
} from '@/modules/user/defs/admin-invitation-service.defs';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { AdminInvitationAlreadyAcceptedException } from '@/modules/user/exceptions/admin-invitation-already-accepted.exception';
import { AdminInvitationAlreadyAdminException } from '@/modules/user/exceptions/admin-invitation-already-admin.exception';
import { AdminInvitationExpiredException } from '@/modules/user/exceptions/admin-invitation-expired.exception';
import { AdminInvitationInvalidException } from '@/modules/user/exceptions/admin-invitation-invalid.exception';
import { AdminInvitationPendingException } from '@/modules/user/exceptions/admin-invitation-pending.exception';
import {
  createAdminInvitationToken,
  hashAdminInvitationToken,
} from '@/modules/user/helpers/admin-invitation-token.helper';
import { AdminInvitationRepository } from '@/modules/user/repository/admin-invitation.repository';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AdminInvitationService {
  constructor(
    private readonly adminInvitationRepository: AdminInvitationRepository,
    private readonly userService: UserService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async createInvitation(
    input: CreateAdminInvitationServiceInput,
  ): Promise<CreateAdminInvitationServiceResult> {
    const email: string = AdminInvitationService.normalizeEmail(input.email);
    const existingUser: UserEntity | null = await this.userService.findUserByEmail(email);
    if (existingUser?.role === UserRole.ADMIN) {
      throw new AdminInvitationAlreadyAdminException();
    }
    const now: Date = new Date();
    const pending: AdminInvitationEntity | null =
      await this.adminInvitationRepository.findPendingByEmail(email, now);
    if (pending !== null) {
      throw new AdminInvitationPendingException(email);
    }
    const token: string = createAdminInvitationToken();
    const invitation: AdminInvitationEntity = await this.adminInvitationRepository.create({
      email,
      tokenHash: hashAdminInvitationToken(token),
      expiresAt: AdminInvitationService.resolveExpiresAt(now),
      invitedByUserId: input.invitedByUserId,
    });
    return { invitation, token };
  }

  async listPendingInvitations(
    input: ListAdminInvitationsServiceInput = {},
  ): Promise<AdminInvitationPage> {
    return this.adminInvitationRepository.listPending({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      now: new Date(),
    });
  }

  async acceptInvitation(input: AcceptAdminInvitationServiceInput): Promise<UserEntity> {
    const invitation: AdminInvitationEntity | null =
      await this.adminInvitationRepository.findByTokenHash(hashAdminInvitationToken(input.token));
    if (invitation === null) {
      throw new AdminInvitationInvalidException();
    }
    AdminInvitationService.assertInvitationAcceptable(invitation, new Date());
    return this.transactionRunner.run(async (context: TransactionContext) => {
      await this.adminInvitationRepository.markAccepted(
        { id: invitation.id, acceptedAt: new Date() },
        context,
      );
      return this.userService.grantInvitedAdmin(
        {
          email: invitation.email,
          passwordHash: input.passwordHash,
          actorUserId: invitation.invitedByUserId,
        },
        context,
      );
    });
  }

  private static assertInvitationAcceptable(invitation: AdminInvitationEntity, now: Date): void {
    if (invitation.status === AdminInvitationStatus.ACCEPTED) {
      throw new AdminInvitationAlreadyAcceptedException();
    }
    if (invitation.expiresAt.getTime() <= now.getTime()) {
      throw new AdminInvitationExpiredException();
    }
  }

  private static resolveExpiresAt(now: Date): Date {
    const windowMs: number =
      ADMIN_INVITATION_WINDOW.days * ADMIN_INVITATION_WINDOW.millisecondsPerDay;
    return new Date(now.getTime() + windowMs);
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
