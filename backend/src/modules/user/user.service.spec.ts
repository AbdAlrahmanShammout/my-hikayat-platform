import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { AdminInvitationAlreadyAdminException } from '@/modules/user/exceptions/admin-invitation-already-admin.exception';
import { UserAdminInviteRequiredException } from '@/modules/user/exceptions/user-admin-invite-required.exception';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';
import { UserInvalidCapabilityException } from '@/modules/user/exceptions/user-invalid-capability.exception';
import { UserLastAdminException } from '@/modules/user/exceptions/user-last-admin.exception';
import { UserSelfManagementException } from '@/modules/user/exceptions/user-self-management.exception';

import { UserService } from './user.service';

function createSampleUser(): UserEntity {
  return new UserEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

describe('UserService', () => {
  let mockUserRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findByEmail: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    list: jest.Mock;
    countByRole: jest.Mock;
  };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let userService: UserService;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      countByRole: jest.fn(),
    };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    userService = new UserService(
      mockUserRepository,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  describe('createUser', () => {
    it('normalizes email and persists a reader who is not a publisher', async () => {
      const expectedUser = createSampleUser();
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);
      const actualUser = await userService.createUser({
        email: '  Reader@Example.com ',
        passwordHash: 'hashed-password',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('reader@example.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'reader@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.READER,
        isPublisher: false,
      });
      expect(actualUser).toBe(expectedUser);
    });

    it('rejects a duplicate email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(createSampleUser());
      await expect(
        userService.createUser({
          email: 'reader@example.com',
          passwordHash: 'hashed-password',
        }),
      ).rejects.toBeInstanceOf(UserEmailConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('enablePublisherCapability', () => {
    it('promotes a reader to an author publisher', async () => {
      const reader = createSampleUser();
      const expectedUser = new UserEntity({
        ...reader,
        role: UserRole.AUTHOR,
        isPublisher: true,
      });
      mockUserRepository.findById.mockResolvedValue(reader);
      mockUserRepository.update.mockResolvedValue(expectedUser);
      const actualUser = await userService.enablePublisherCapability({ userId: 1 });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          role: UserRole.AUTHOR,
          isPublisher: true,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 1,
          action: AuditAction.PUBLISHER_ENABLED,
          subjectType: AuditSubjectType.USER,
          subjectId: 1,
          metadata: {
            fromRole: UserRole.READER,
            toRole: UserRole.AUTHOR,
          },
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('keeps a privileged role and only sets the publisher flag', async () => {
      const admin = new UserEntity({
        ...createSampleUser(),
        role: UserRole.ADMIN,
      });
      const expectedUser = new UserEntity({
        ...admin,
        isPublisher: true,
      });
      mockUserRepository.findById.mockResolvedValue(admin);
      mockUserRepository.update.mockResolvedValue(expectedUser);
      const actualUser = await userService.enablePublisherCapability({ userId: 1 });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          role: UserRole.ADMIN,
          isPublisher: true,
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('does not write when the user is already an author publisher', async () => {
      const publisher = new UserEntity({
        ...createSampleUser(),
        role: UserRole.AUTHOR,
        isPublisher: true,
      });
      mockUserRepository.findById.mockResolvedValue(publisher);
      const actualUser = await userService.enablePublisherCapability({ userId: 1 });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(actualUser).toBe(publisher);
    });

    it('throws when the user is missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userService.enablePublisherCapability({ userId: 99 })).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('listUsers', () => {
    it('forwards filters with default pagination', async () => {
      const expectedPage = { entities: [createSampleUser()], total: 1 };
      mockUserRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await userService.listUsers({
        role: UserRole.READER,
        email: '  Reader@Example.com ',
      });
      expect(mockUserRepository.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        role: UserRole.READER,
        isPublisher: undefined,
        email: 'reader@example.com',
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('updateManagedUser', () => {
    it('rejects granting admin through managed-user update', async () => {
      mockUserRepository.findById.mockResolvedValue(createSampleUser());
      await expect(
        userService.updateManagedUser({
          userId: 1,
          actorUserId: 9,
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(UserAdminInviteRequiredException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('enables publisher on a reader by promoting to author', async () => {
      const reader = createSampleUser();
      const expectedUser = new UserEntity({
        ...reader,
        role: UserRole.AUTHOR,
        isPublisher: true,
      });
      mockUserRepository.findById.mockResolvedValue(reader);
      mockUserRepository.update.mockResolvedValue(expectedUser);
      const actualUser = await userService.updateManagedUser({
        userId: 1,
        actorUserId: 9,
        isPublisher: true,
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          role: UserRole.AUTHOR,
          isPublisher: true,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.USER_ROLE_CHANGED, actorUserId: 9 }),
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.PUBLISHER_ENABLED, actorUserId: 9 }),
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('rejects changing the signed-in admin', async () => {
      mockUserRepository.findById.mockResolvedValue(createSampleUser());
      await expect(
        userService.updateManagedUser({
          userId: 1,
          actorUserId: 1,
          role: UserRole.ADMIN,
        }),
      ).rejects.toBeInstanceOf(UserSelfManagementException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('rejects an author without publisher capability', async () => {
      mockUserRepository.findById.mockResolvedValue(createSampleUser());
      await expect(
        userService.updateManagedUser({
          userId: 1,
          actorUserId: 9,
          role: UserRole.AUTHOR,
          isPublisher: false,
        }),
      ).rejects.toBeInstanceOf(UserInvalidCapabilityException);
    });

    it('rejects demoting the last remaining admin', async () => {
      const admin = new UserEntity({
        ...createSampleUser(),
        id: 4,
        role: UserRole.ADMIN,
      });
      mockUserRepository.findById.mockResolvedValue(admin);
      mockUserRepository.countByRole.mockResolvedValue(1);
      await expect(
        userService.updateManagedUser({
          userId: 4,
          actorUserId: 9,
          role: UserRole.READER,
        }),
      ).rejects.toBeInstanceOf(UserLastAdminException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteManagedUser', () => {
    it('soft-deletes another user and records the actor', async () => {
      const reader = createSampleUser();
      const expectedUser = new UserEntity({
        ...reader,
        deletedAt: new Date('2026-08-15T00:00:00.000Z'),
      });
      mockUserRepository.findById.mockResolvedValue(reader);
      mockUserRepository.delete.mockResolvedValue(expectedUser);
      const actualUser = await userService.deleteManagedUser({ userId: 1, actorUserId: 9 });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1, undefined);
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.USER_DELETED,
          subjectType: AuditSubjectType.USER,
          subjectId: 1,
          metadata: {
            fromRole: UserRole.READER,
            wasPublisher: false,
          },
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('rejects deleting the signed-in admin', async () => {
      mockUserRepository.findById.mockResolvedValue(createSampleUser());
      await expect(
        userService.deleteManagedUser({ userId: 1, actorUserId: 1 }),
      ).rejects.toBeInstanceOf(UserSelfManagementException);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('rejects deleting the last remaining admin', async () => {
      const admin = new UserEntity({
        ...createSampleUser(),
        id: 4,
        role: UserRole.ADMIN,
      });
      mockUserRepository.findById.mockResolvedValue(admin);
      mockUserRepository.countByRole.mockResolvedValue(1);
      await expect(
        userService.deleteManagedUser({ userId: 4, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(UserLastAdminException);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('grantInvitedAdmin', () => {
    it('creates a new admin when the email is unknown', async () => {
      const expectedUser = new UserEntity({
        ...createSampleUser(),
        role: UserRole.ADMIN,
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);
      const actualUser = await userService.grantInvitedAdmin({
        email: '  New-Admin@Example.com ',
        passwordHash: 'hashed-password',
        actorUserId: 9,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        {
          email: 'new-admin@example.com',
          passwordHash: 'hashed-password',
          role: UserRole.ADMIN,
          isPublisher: false,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.USER_ROLE_CHANGED,
          subjectType: AuditSubjectType.USER,
          subjectId: 1,
          metadata: {
            fromRole: null,
            toRole: UserRole.ADMIN,
            grantedByInvitation: true,
          },
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('promotes an existing non-admin and keeps publisher capability', async () => {
      const author = new UserEntity({
        ...createSampleUser(),
        role: UserRole.AUTHOR,
        isPublisher: true,
      });
      const expectedUser = new UserEntity({
        ...author,
        role: UserRole.ADMIN,
        passwordHash: 'new-hash',
      });
      mockUserRepository.findByEmail.mockResolvedValue(author);
      mockUserRepository.update.mockResolvedValue(expectedUser);
      const actualUser = await userService.grantInvitedAdmin({
        email: 'reader@example.com',
        passwordHash: 'new-hash',
        actorUserId: 9,
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          role: UserRole.ADMIN,
          isPublisher: true,
          passwordHash: 'new-hash',
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.USER_ROLE_CHANGED,
          subjectType: AuditSubjectType.USER,
          subjectId: 1,
          metadata: {
            fromRole: UserRole.AUTHOR,
            toRole: UserRole.ADMIN,
            grantedByInvitation: true,
          },
        },
        undefined,
      );
      expect(actualUser).toBe(expectedUser);
    });

    it('rejects granting admin to an email that is already an admin', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new UserEntity({
          ...createSampleUser(),
          role: UserRole.ADMIN,
        }),
      );
      await expect(
        userService.grantInvitedAdmin({
          email: 'reader@example.com',
          passwordHash: 'hashed-password',
          actorUserId: 9,
        }),
      ).rejects.toBeInstanceOf(AdminInvitationAlreadyAdminException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('returns the user when found', async () => {
      const expectedUser = createSampleUser();
      mockUserRepository.findById.mockResolvedValue(expectedUser);
      const actualUser = await userService.getUserById(1);
      expect(actualUser).toBe(expectedUser);
    });

    it('throws when the user is missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userService.getUserById(99)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('getUserByEmail', () => {
    it('throws when the email is not registered', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(userService.getUserByEmail('missing@example.com')).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
