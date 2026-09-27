import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserAdminDetailService } from '@/modules/user/user-admin-detail.service';
import { UserService } from '@/modules/user/user.service';

import { UserAdminController } from './user.admin.controller';

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

function createSampleAdmin(): UserEntity {
  return new UserEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    isPublisher: false,
  });
}

describe('UserAdminController', () => {
  let userAdminController: UserAdminController;
  let mockUserService: {
    listManagedUsers: jest.Mock;
    getUserById: jest.Mock;
    updateManagedUser: jest.Mock;
    deleteManagedUser: jest.Mock;
  };
  let mockUserAdminDetailService: {
    getAdminUserDetail: jest.Mock;
  };

  beforeEach(async () => {
    mockUserService = {
      listManagedUsers: jest.fn(),
      getUserById: jest.fn(),
      updateManagedUser: jest.fn(),
      deleteManagedUser: jest.fn(),
    };
    mockUserAdminDetailService = {
      getAdminUserDetail: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UserAdminController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserAdminDetailService, useValue: mockUserAdminDetailService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    userAdminController = moduleRef.get(UserAdminController);
  });

  describe('listUsers', () => {
    it('forwards filters into the list envelope', async () => {
      mockUserService.listManagedUsers.mockResolvedValue({
        items: [
          {
            user: createSampleUser(),
            lastSessionAt: new Date('2026-09-01T08:30:00.000Z'),
            currentPlan: { name: 'Monthly', kind: 'monthly_paid' },
          },
        ],
        total: 1,
      });
      const actualResponse = await userAdminController.listUsers({
        limit: 10,
        offset: 0,
        role: UserRole.READER,
        excludeRole: UserRole.ADMIN,
      });
      expect(mockUserService.listManagedUsers).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        role: UserRole.READER,
        excludeRole: UserRole.ADMIN,
        isPublisher: undefined,
        email: undefined,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.users[0].id).toBe(1);
      expect(actualResponse.users[0].currentPlan?.name).toBe('Monthly');
      expect(actualResponse.users[0].lastSessionAt?.toISOString()).toBe('2026-09-01T08:30:00.000Z');
      expect(actualResponse.users[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('getUser', () => {
    it('returns the requested user with subscription and reading progress', async () => {
      mockUserAdminDetailService.getAdminUserDetail.mockResolvedValue({
        user: createSampleUser(),
        subscription: null,
        periodProgress: {
          periodStartedAt: null,
          periodEndsAt: null,
          remainingMs: null,
          elapsedPercent: null,
        },
        readingItems: [],
      });
      const actualResponse = await userAdminController.getUser(1);
      expect(mockUserAdminDetailService.getAdminUserDetail).toHaveBeenCalledWith(1);
      expect(actualResponse.user.email).toBe('reader@example.com');
      expect(actualResponse.subscription).toBeNull();
      expect(actualResponse.readingProgress).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('threads the signed-in admin as actor', async () => {
      const expectedUser = new UserEntity({
        ...createSampleUser(),
        role: UserRole.AUTHOR,
        isPublisher: true,
      });
      mockUserService.updateManagedUser.mockResolvedValue(expectedUser);
      const actualResponse = await userAdminController.updateUser(
        1,
        { role: UserRole.AUTHOR },
        createSampleAdmin(),
      );
      expect(mockUserService.updateManagedUser).toHaveBeenCalledWith({
        userId: 1,
        actorUserId: 9,
        role: UserRole.AUTHOR,
        isPublisher: undefined,
      });
      expect(actualResponse.role).toBe(UserRole.AUTHOR);
    });
  });

  describe('deleteUser', () => {
    it('threads the signed-in admin as actor', async () => {
      mockUserService.deleteManagedUser.mockResolvedValue(createSampleUser());
      const actualResponse = await userAdminController.deleteUser(1, createSampleAdmin());
      expect(mockUserService.deleteManagedUser).toHaveBeenCalledWith({
        userId: 1,
        actorUserId: 9,
      });
      expect(actualResponse.id).toBe(1);
    });
  });
});
