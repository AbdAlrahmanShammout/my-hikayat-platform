import { AppConfigService } from '@/config/app/app-config.service';
import { ADMIN_INVITATION_WINDOW } from '@/modules/user/consts/admin-invitation.constant';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { AdminInvitationAlreadyAcceptedException } from '@/modules/user/exceptions/admin-invitation-already-accepted.exception';
import { AdminInvitationAlreadyAdminException } from '@/modules/user/exceptions/admin-invitation-already-admin.exception';
import { AdminInvitationExpiredException } from '@/modules/user/exceptions/admin-invitation-expired.exception';
import { AdminInvitationInvalidException } from '@/modules/user/exceptions/admin-invitation-invalid.exception';
import { AdminInvitationPendingException } from '@/modules/user/exceptions/admin-invitation-pending.exception';
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
    listPending: jest.Mock;
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
  let adminInvitationService: AdminInvitationService;

  beforeEach(() => {
    mockAdminInvitationRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      findPendingByEmail: jest.fn(),
      listPending: jest.fn(),
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
    adminInvitationService = new AdminInvitationService(
      mockAdminInvitationRepository,
      mockUserService as unknown as UserService,
      mockTransactionRunner,
      mockMailManagerService,
      mockAppConfigService as unknown as AppConfigService,
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
      expect(mockMailManagerService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'new-admin@example.com',
          subject: expect.stringContaining('Noory'),
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

  describe('listPendingInvitations', () => {
    it('forwards default pagination and the current time', async () => {
      const expectedPage = { entities: [createSampleInvitation()], total: 1 };
      mockAdminInvitationRepository.listPending.mockResolvedValue(expectedPage);
      const actualPage = await adminInvitationService.listPendingInvitations();
      expect(mockAdminInvitationRepository.listPending).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        now: expect.any(Date),
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
  });
});
