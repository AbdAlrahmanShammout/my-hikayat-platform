import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AppConfigService } from '@/config/app/app-config.service';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import {
  ADMIN_INVITATION_RESEND_COOLDOWN_SECONDS,
  ADMIN_INVITATION_WINDOW,
} from '@/modules/user/consts/admin-invitation.constant';
import { AdminInvitationPage } from '@/modules/user/defs/admin-invitation-repository.defs';
import {
  AcceptAdminInvitationServiceInput,
  CreateAdminInvitationServiceInput,
  CreateAdminInvitationServiceResult,
  ListAdminInvitationsServiceInput,
  ResendAdminInvitationServiceInput,
  RevokeAdminInvitationServiceInput,
} from '@/modules/user/defs/admin-invitation-service.defs';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { AdminInvitationAlreadyAcceptedException } from '@/modules/user/exceptions/admin-invitation-already-accepted.exception';
import { AdminInvitationAlreadyAdminException } from '@/modules/user/exceptions/admin-invitation-already-admin.exception';
import { AdminInvitationExpiredException } from '@/modules/user/exceptions/admin-invitation-expired.exception';
import { AdminInvitationInvalidException } from '@/modules/user/exceptions/admin-invitation-invalid.exception';
import { AdminInvitationNotResendableException } from '@/modules/user/exceptions/admin-invitation-not-resendable.exception';
import { AdminInvitationNotRevocableException } from '@/modules/user/exceptions/admin-invitation-not-revocable.exception';
import { AdminInvitationPendingException } from '@/modules/user/exceptions/admin-invitation-pending.exception';
import { AdminInvitationResendCooldownException } from '@/modules/user/exceptions/admin-invitation-resend-cooldown.exception';
import { AdminInvitationRevokedException } from '@/modules/user/exceptions/admin-invitation-revoked.exception';
import { buildAdminInvitationMail } from '@/modules/user/helpers/admin-invitation-mail.helper';
import {
  createAdminInvitationToken,
  hashAdminInvitationToken,
} from '@/modules/user/helpers/admin-invitation-token.helper';
import { AdminInvitationRepository } from '@/modules/user/repository/admin-invitation.repository';
import { UserService } from '@/modules/user/user.service';
import { MailFailureException } from '@/providers/mail/exceptions/mail-failure.exception';
import { MailManagerService } from '@/providers/mail/mail-manager.service';

type SendAdminInvitationMailInput = {
  readonly invitation: AdminInvitationEntity;
  readonly token: string;
};

@Injectable()
export class AdminInvitationService {
  constructor(
    private readonly adminInvitationRepository: AdminInvitationRepository,
    private readonly userService: UserService,
    private readonly transactionRunner: TransactionRunner,
    private readonly mailManagerService: MailManagerService,
    private readonly appConfigService: AppConfigService,
    private readonly auditLogService: AuditLogService,
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
      lastSentAt: now,
    });
    await this.sendInvitationMail({ invitation, token });
    await this.auditLogService.append({
      actorUserId: input.invitedByUserId,
      action: AuditAction.INVITATION_CREATED,
      subjectType: AuditSubjectType.INVITATION,
      subjectId: invitation.id,
      metadata: { email },
    });
    return { invitation, token };
  }

  async listInvitations(
    input: ListAdminInvitationsServiceInput = {},
  ): Promise<AdminInvitationPage> {
    return this.adminInvitationRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      now: new Date(),
      status: input.status,
      email: input.email,
    });
  }

  async resendInvitation(input: ResendAdminInvitationServiceInput): Promise<AdminInvitationEntity> {
    const invitation: AdminInvitationEntity = await this.getInvitation(input.id);
    const now: Date = new Date();
    if (
      invitation.status !== AdminInvitationStatus.PENDING ||
      invitation.expiresAt.getTime() <= now.getTime()
    ) {
      throw new AdminInvitationNotResendableException();
    }
    AdminInvitationService.assertResendCooldown(invitation.lastSentAt, now);
    const token: string = createAdminInvitationToken();
    const previousDelivery = {
      tokenHash: invitation.tokenHash,
      expiresAt: invitation.expiresAt,
      lastSentAt: invitation.lastSentAt,
      resendCount: invitation.resendCount,
    };
    const updated: AdminInvitationEntity = await this.adminInvitationRepository.replaceDelivery({
      id: invitation.id,
      tokenHash: hashAdminInvitationToken(token),
      expiresAt: AdminInvitationService.resolveExpiresAt(now),
      lastSentAt: now,
      resendCount: invitation.resendCount + 1,
    });
    try {
      await this.mailManagerService.send(
        buildAdminInvitationMail({
          email: updated.email,
          token,
          expiresAt: updated.expiresAt,
          publicOrigin: this.appConfigService.publicOrigin,
        }),
      );
    } catch (err: unknown) {
      await this.adminInvitationRepository.replaceDelivery({
        id: invitation.id,
        ...previousDelivery,
      });
      if (err instanceof MailFailureException) {
        throw err;
      }
      throw new MailFailureException();
    }
    await this.auditLogService.append({
      actorUserId: input.actorUserId,
      action: AuditAction.INVITATION_RESENT,
      subjectType: AuditSubjectType.INVITATION,
      subjectId: invitation.id,
      metadata: { email: invitation.email },
    });
    return updated;
  }

  async revokeInvitation(input: RevokeAdminInvitationServiceInput): Promise<AdminInvitationEntity> {
    const invitation: AdminInvitationEntity = await this.getInvitation(input.id);
    if (invitation.status !== AdminInvitationStatus.PENDING) {
      throw new AdminInvitationNotRevocableException();
    }
    const reason: string | null =
      input.reason === undefined || input.reason === null || input.reason.trim() === ''
        ? null
        : input.reason.trim();
    const revoked: AdminInvitationEntity = await this.adminInvitationRepository.revoke({
      id: invitation.id,
      revokedAt: new Date(),
      revokedByUserId: input.actorUserId,
      revokeReason: reason,
    });
    await this.auditLogService.append({
      actorUserId: input.actorUserId,
      action: AuditAction.INVITATION_REVOKED,
      subjectType: AuditSubjectType.INVITATION,
      subjectId: invitation.id,
      reason,
      metadata: { email: invitation.email },
    });
    return revoked;
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

  private async sendInvitationMail(input: SendAdminInvitationMailInput): Promise<void> {
    try {
      await this.mailManagerService.send(
        buildAdminInvitationMail({
          email: input.invitation.email,
          token: input.token,
          expiresAt: input.invitation.expiresAt,
          publicOrigin: this.appConfigService.publicOrigin,
        }),
      );
    } catch (err: unknown) {
      await this.adminInvitationRepository.delete(input.invitation.id);
      if (err instanceof MailFailureException) {
        throw err;
      }
      throw new MailFailureException();
    }
  }

  private async getInvitation(id: number): Promise<AdminInvitationEntity> {
    const invitation: AdminInvitationEntity | null =
      await this.adminInvitationRepository.findById(id);
    if (invitation === null) {
      throw new ResourceNotFoundException('Admin invitation', id);
    }
    return invitation;
  }

  private static assertInvitationAcceptable(invitation: AdminInvitationEntity, now: Date): void {
    if (invitation.status === AdminInvitationStatus.REVOKED) {
      throw new AdminInvitationRevokedException();
    }
    if (invitation.status === AdminInvitationStatus.ACCEPTED) {
      throw new AdminInvitationAlreadyAcceptedException();
    }
    if (invitation.expiresAt.getTime() <= now.getTime()) {
      throw new AdminInvitationExpiredException();
    }
  }

  private static assertResendCooldown(lastSentAt: Date | null, now: Date): void {
    if (lastSentAt === null) {
      return;
    }
    const elapsedMs: number = now.getTime() - lastSentAt.getTime();
    const cooldownMs: number = ADMIN_INVITATION_RESEND_COOLDOWN_SECONDS * 1000;
    if (elapsedMs >= cooldownMs) {
      return;
    }
    const retryAfterSeconds: number = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
    throw new AdminInvitationResendCooldownException(retryAfterSeconds);
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
