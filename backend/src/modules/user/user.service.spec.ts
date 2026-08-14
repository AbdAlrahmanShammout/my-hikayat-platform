import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
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
  };
  let userService: UserService;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    userService = new UserService(mockUserRepository);
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
