import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '@/authentication/auth.service';
import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';

import { UserReaderController } from './user.reader.controller';

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

function createAuthorUser(): UserEntity {
  return new UserEntity({
    ...createSampleUser(),
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

describe('UserReaderController', () => {
  let userReaderController: UserReaderController;
  let mockUserService: { enablePublisherCapability: jest.Mock };
  let mockAuthService: { createSession: jest.Mock };

  beforeEach(async () => {
    mockUserService = { enablePublisherCapability: jest.fn() };
    mockAuthService = { createSession: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UserReaderController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    userReaderController = moduleRef.get(UserReaderController);
  });

  describe('enablePublisherCapability', () => {
    it('issues a session for the updated principal', async () => {
      const currentUser: UserEntity = createSampleUser();
      const authorUser: UserEntity = createAuthorUser();
      const expectedSession: AuthSession = {
        user: authorUser,
        accessToken: 'signed.jwt',
        expiresIn: '15m',
      };
      mockUserService.enablePublisherCapability.mockResolvedValue(authorUser);
      mockAuthService.createSession.mockReturnValue(expectedSession);
      const actualResponse = await userReaderController.enablePublisherCapability(currentUser);
      expect(mockUserService.enablePublisherCapability).toHaveBeenCalledWith({ userId: 1 });
      expect(mockAuthService.createSession).toHaveBeenCalledWith(authorUser);
      expect(actualResponse.accessToken).toBe('signed.jwt');
      expect(actualResponse.user.role).toBe(UserRole.AUTHOR);
      expect(actualResponse.user.isPublisher).toBe(true);
      expect(actualResponse.user).not.toHaveProperty('passwordHash');
    });
  });
});
