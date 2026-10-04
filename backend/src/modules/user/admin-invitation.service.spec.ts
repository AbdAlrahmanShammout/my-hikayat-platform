import { AppConfigService } from '@/config/app/app-config.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { ADMIN_INVITATION_WINDOW } from '@/modules/user/consts/admin-invitation.constant';
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
import { hashAdminInvitationToken } from '@/modules/user/helpers/admin-invitation-token.helper';
import { UserService } from '@/modules/user/user.service';
import { MailFailureException } from '@/providers/mail/exceptions/mail-failure.exception';

import { AdminInvitationService } from './admin-invitation.service';

function createSampleInvitation(
  overrides: Partial<ConstructorParameters<typeof AdminInvitationEntity>[0]> = {},
): AdminInvitationEntity {
  return new AdminInvitationEntity({
    id: 4,
    createdAt: new Date('2026-08-17T00:00:00.000Z'),
    updatedAt: new Date('2026-08-17T00:00:00.000Z'),
    email: 'new-admin@example.com',
    tokenHash: 'hashed-token',
    status: AdminInvitationStatus.PENDING,
    expiresAt: new Date('2026-08-24T00:00:00.000Z'),
    invitedByUserId: 9,
    acceptedAt: null,
    lastSentAt: null,
    resendCount: 0,
    revokedAt: null,
    revokedByUserId: null,
    revokeReason: null,
    ...overrides,
  });
}

function createSampleUser(role: UserRole = UserRole.READER): UserEntity {
  return new UserEntity({
    id: 1,
    createdAt: new Date('2026-08-17T00:00:00.000Z'),
    updatedAt: new Date('2026-08-17T00:00:00.000Z'),
    email: 'new-admin@example.com',
    passwordHash: 'hashed-password',
    role,
    isPublisher: false,
  });
}

describe('AdminInvitationService', () => {
  let mockAdminInvitationRepository: {
    create: jest.Mock;
    findByTokenHash: jest.Mock;
    findPendingByEmail: jest.Mock;
    findById: jest.Mock;
    list: jest.Mock;
    replaceDelivery: jest.Mock;
    revoke: jest.Mock;
    markAccepted: jest.Mock;
    delete: jest.Mock;
  };
  let mockUserService: {
    findUserByEmail: jest.Mock;
    grantInvitedAdmin: jest.Mock;
  };
  let mockTransactionRunner: { run: jest.Mock };
  let mockMailManagerService: { send: jest.Mock };
  let mockAppConfigService: { publicOrigin: string };
  let mockAuditLogService: { append: jest.Mock };
  let adminInvitationService: AdminInvitationService;

  beforeEach(() => {
    mockAdminInvitationRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      findPendingByEmail: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      replaceDelivery: jest.fn(),
      revoke: jest.fn(),
      markAccepted: jest.fn(),
      delete: jest.fn(),
    };
    mockUserService = {
      findUserByEmail: jest.fn(),
      grantInvitedAdmin: jest.fn(),
    };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    mockMailManagerService = { send: jest.fn().mockResolvedValue(undefined) };
    mockAppConfigService = { publicOrigin: 'http://localhost:5173' };
    mockAuditLogService = { append: jest.fn().mockResolvedValue(undefined) };
    adminInvitationService = new AdminInvitationService(
      mockAdminInvitationRepository,
      mockUserService as unknown as UserService,
      mockTransactionRunner,
      mockMailManagerService,
      mockAppConfigService as unknown as AppConfigService,
      mockAuditLogService as unknown as import('@/modules/audit/audit-log.service').AuditLogService,
    );
  });

  describe('createInvitation', () => {
    it('stores a hashed token and returns the raw token once', async () => {
      const expectedInvitation = createSampleInvitation();
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.findPendingByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.create.mockResolvedValue(expectedInvitation);
      const actualResult = await adminInvitationService.createInvitation({
        email: '  New-Admin@Example.com ',
        invitedByUserId: 9,
      });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith('new-admin@example.com');
      expect(mockAdminInvitationRepository.create).toHaveBeenCalledWith({
        email: 'new-admin@example.com',
        tokenHash: hashAdminInvitationToken(actualResult.token),
        expiresAt: expect.any(Date),
        invitedByUserId: 9,
        lastSentAt: expect.any(Date),
      });
      const actualExpiresAt: Date = mockAdminInvitationRepository.create.mock.calls[0][0]
        .expiresAt as Date;
      const actualWindowMs: number = actualExpiresAt.getTime() - Date.now();
      const expectedWindowMs: number =
        ADMIN_INVITATION_WINDOW.days * ADMIN_INVITATION_WINDOW.millisecondsPerDay;
      expect(actualWindowMs).toBeGreaterThan(expectedWindowMs - 5_000);
      expect(actualWindowMs).toBeLessThanOrEqual(expectedWindowMs);
      expect(actualResult.invitation).toBe(expectedInvitation);
      expect(actualResult.token).toEqual(expect.any(String));
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.INVITATION_CREATED,
          subjectType: AuditSubjectType.INVITATION,
          subjectId: 4,
        }),
      );
      expect(mockMailManagerService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'new-admin@example.com',
          subject: expect.stringContaining('My Hikayat'),
          text: expect.stringContaining(actualResult.token),
        }),
      );
    });

    it('revokes the invitation when mail delivery fails', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.findPendingByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.create.mockResolvedValue(createSampleInvitation());
      mockMailManagerService.send.mockRejectedValue(new MailFailureException());
      await expect(
        adminInvitationService.createInvitation({
          email: 'new-admin@example.com',
          invitedByUserId: 9,
        }),
      ).rejects.toBeInstanceOf(MailFailureException);
      expect(mockAdminInvitationRepository.delete).toHaveBeenCalledWith(4);
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });

    it('revokes the invitation when mail delivery fails unexpectedly', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.findPendingByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.create.mockResolvedValue(createSampleInvitation());
      mockMailManagerService.send.mockRejectedValue(new Error('smtp down'));
      await expect(
        adminInvitationService.createInvitation({
          email: 'new-admin@example.com',
          invitedByUserId: 9,
        }),
      ).rejects.toBeInstanceOf(MailFailureException);
      expect(mockAdminInvitationRepository.delete).toHaveBeenCalledWith(4);
    });

    it('rejects inviting an email that is already an admin', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(createSampleUser(UserRole.ADMIN));
      await expect(
        adminInvitationService.createInvitation({
          email: 'new-admin@example.com',
          invitedByUserId: 9,
        }),
      ).rejects.toBeInstanceOf(AdminInvitationAlreadyAdminException);
      expect(mockAdminInvitationRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate unexpired pending invitation', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockAdminInvitationRepository.findPendingByEmail.mockResolvedValue(createSampleInvitation());
      await expect(
        adminInvitationService.createInvitation({
          email: 'new-admin@example.com',
          invitedByUserId: 9,
        }),
      ).rejects.toBeInstanceOf(AdminInvitationPendingException);
      expect(mockAdminInvitationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('listInvitations', () => {
    it('forwards default pagination and the current time', async () => {
      const expectedPage = { entities: [createSampleInvitation()], total: 1 };
      mockAdminInvitationRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await adminInvitationService.listInvitations();
      expect(mockAdminInvitationRepository.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        now: expect.any(Date),
        status: undefined,
        email: undefined,
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('acceptInvitation', () => {
    it('marks the invitation accepted and grants admin', async () => {
      const invitation = createSampleInvitation({
        expiresAt: new Date(Date.now() + 60_000),
      });
      const expectedUser = createSampleUser(UserRole.ADMIN);
      mockAdminInvitationRepository.findByTokenHash.mockResolvedValue(invitation);
      mockUserService.grantInvitedAdmin.mockResolvedValue(expectedUser);
      const actualUser = await adminInvitationService.acceptInvitation({
        token: 'raw-token',
        passwordHash: 'hashed-password',
      });
      expect(mockAdminInvitationRepository.findByTokenHash).toHaveBeenCalledWith(
        hashAdminInvitationToken('raw-token'),
      );
      expect(mockAdminInvitationRepository.markAccepted).toHaveBeenCalledWith(
        { id: 4, acceptedAt: expect.any(Date) },
        undefined,
      );
      expect(mockUserService.grantInvitedAdmin).toHaveBeenCalledWith(
        {
          email: 'new-admin@example.com',
          passwordHash: 'hashed-password',
          actorUserId: 9,
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('rejects an unknown token', async () => {
      mockAdminInvitationRepository.findByTokenHash.mockResolvedValue(null);
      await expect(
        adminInvitationService.acceptInvitation({
          token: 'missing',
          passwordHash: 'hashed-password',
        }),
      ).rejects.toBeInstanceOf(AdminInvitationInvalidException);
    });

    it('rejects an already accepted invitation', async () => {
      mockAdminInvitationRepository.findByTokenHash.mockResolvedValue(
        createSampleInvitation({
          status: AdminInvitationStatus.ACCEPTED,
          acceptedAt: new Date('2026-08-18T00:00:00.000Z'),
          expiresAt: new Date(Date.now() + 60_000),
        }),
      );
      await expect(
        adminInvitationService.acceptInvitation({
          token: 'raw-token',
          passwordHash: 'hashed-password',
        }),
      ).rejects.toBeInstanceOf(AdminInvitationAlreadyAcceptedException);
      expect(mockUserService.grantInvitedAdmin).not.toHaveBeenCalled();
    });

    it('rejects an expired invitation', async () => {
      mockAdminInvitationRepository.findByTokenHash.mockResolvedValue(
        createSampleInvitation({
          expiresAt: new Date(Date.now() - 1_000),
        }),
      );
      await expect(
        adminInvitationService.acceptInvitation({
          token: 'raw-token',
          passwordHash: 'hashed-password',
        }),
      ).rejects.toBeInstanceOf(AdminInvitationExpiredException);
      expect(mockUserService.grantInvitedAdmin).not.toHaveBeenCalled();
    });

    it('rejects a revoked invitation even when it has not expired', async () => {
      mockAdminInvitationRepository.findByTokenHash.mockResolvedValue(
        createSampleInvitation({
          status: AdminInvitationStatus.REVOKED,
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: new Date(),
        }),
      );
      await expect(
        adminInvitationService.acceptInvitation({
          token: 'raw-token',
          passwordHash: 'hashed-password',
        }),
      ).rejects.toBeInstanceOf(AdminInvitationRevokedException);
      expect(mockUserService.grantInvitedAdmin).not.toHaveBeenCalled();
    });
  });

  describe('resendInvitation', () => {
    it('rotates the token, increments the resend count, and audits the action', async () => {
      const invitation = createSampleInvitation({
        expiresAt: new Date(Date.now() + 60_000),
        lastSentAt: new Date(Date.now() - 120_000),
        resendCount: 1,
      });
      const resent = createSampleInvitation({ resendCount: 2 });
      mockAdminInvitationRepository.findById.mockResolvedValue(invitation);
      mockAdminInvitationRepository.replaceDelivery.mockResolvedValue(resent);
      const actualInvitation = await adminInvitationService.resendInvitation({
        id: 4,
        actorUserId: 9,
      });
      expect(mockAdminInvitationRepository.replaceDelivery).toHaveBeenCalledWith(
        expect.objectContaining({ id: 4, resendCount: 2 }),
      );
      expect(mockMailManagerService.send).toHaveBeenCalled();
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.INVITATION_RESENT,
          subjectType: AuditSubjectType.INVITATION,
          subjectId: 4,
        }),
      );
      expect(actualInvitation).toBe(resent);
      expect(JSON.stringify(mockAuditLogService.append.mock.calls[0][0])).not.toContain(
        'raw-token',
      );
    });

    it('rejects an expired invitation', async () => {
      mockAdminInvitationRepository.findById.mockResolvedValue(
        createSampleInvitation({ expiresAt: new Date(Date.now() - 1_000) }),
      );
      await expect(
        adminInvitationService.resendInvitation({ id: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(AdminInvitationNotResendableException);
    });

    it('rejects a revoked invitation', async () => {
      mockAdminInvitationRepository.findById.mockResolvedValue(
        createSampleInvitation({ status: AdminInvitationStatus.REVOKED }),
      );
      await expect(
        adminInvitationService.resendInvitation({ id: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(AdminInvitationNotResendableException);
    });

    it('rejects a resend inside the cooldown window', async () => {
      mockAdminInvitationRepository.findById.mockResolvedValue(
        createSampleInvitation({
          expiresAt: new Date(Date.now() + 60_000),
          lastSentAt: new Date(),
        }),
      );
      await expect(
        adminInvitationService.resendInvitation({ id: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(AdminInvitationResendCooldownException);
      expect(mockAdminInvitationRepository.replaceDelivery).not.toHaveBeenCalled();
    });

    it('restores the previous token when mail delivery fails', async () => {
      const invitation = createSampleInvitation({
        tokenHash: 'previous-hash',
        expiresAt: new Date(Date.now() + 60_000),
        lastSentAt: new Date(Date.now() - 120_000),
        resendCount: 0,
      });
      mockAdminInvitationRepository.findById.mockResolvedValue(invitation);
      mockAdminInvitationRepository.replaceDelivery.mockResolvedValue(invitation);
      mockMailManagerService.send.mockRejectedValue(new MailFailureException());
      await expect(
        adminInvitationService.resendInvitation({ id: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(MailFailureException);
      expect(mockAdminInvitationRepository.replaceDelivery).toHaveBeenLastCalledWith({
        id: 4,
        tokenHash: 'previous-hash',
        expiresAt: invitation.expiresAt,
        lastSentAt: invitation.lastSentAt,
        resendCount: 0,
      });
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });
  });

  describe('revokeInvitation', () => {
    it('marks the invitation revoked and writes an audit row', async () => {
      const invitation = createSampleInvitation({ expiresAt: new Date(Date.now() + 60_000) });
      const revoked = createSampleInvitation({ status: AdminInvitationStatus.REVOKED });
      mockAdminInvitationRepository.findById.mockResolvedValue(invitation);
      mockAdminInvitationRepository.revoke.mockResolvedValue(revoked);
      const actualInvitation = await adminInvitationService.revokeInvitation({
        id: 4,
        actorUserId: 9,
        reason: 'sent to the wrong person',
      });
      expect(mockAdminInvitationRepository.revoke).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 4,
          revokedByUserId: 9,
          revokeReason: 'sent to the wrong person',
        }),
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.INVITATION_REVOKED,
          subjectType: AuditSubjectType.INVITATION,
          reason: 'sent to the wrong person',
        }),
      );
      expect(actualInvitation).toBe(revoked);
    });

    it('rejects revoking an accepted invitation', async () => {
      mockAdminInvitationRepository.findById.mockResolvedValue(
        createSampleInvitation({ status: AdminInvitationStatus.ACCEPTED }),
      );
      await expect(
        adminInvitationService.revokeInvitation({ id: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(AdminInvitationNotRevocableException);
    });
  });
});
