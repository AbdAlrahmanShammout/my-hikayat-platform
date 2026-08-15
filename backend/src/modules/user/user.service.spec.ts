import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';

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
    updatePublisherCapability: jest.Mock;
  };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let userService: UserService;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      updatePublisherCapability: jest.fn(),
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
      mockUserRepository.updatePublisherCapability.mockResolvedValue(expectedUser);
      const actualUser = await userService.enablePublisherCapability({ userId: 1 });
      expect(mockUserRepository.updatePublisherCapability).toHaveBeenCalledWith(
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
      mockUserRepository.updatePublisherCapability.mockResolvedValue(expectedUser);
      const actualUser = await userService.enablePublisherCapability({ userId: 1 });
      expect(mockUserRepository.updatePublisherCapability).toHaveBeenCalledWith(
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
      expect(mockUserRepository.updatePublisherCapability).not.toHaveBeenCalled();
      expect(actualUser).toBe(publisher);
    });

    it('throws when the user is missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userService.enablePublisherCapability({ userId: 99 })).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
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
