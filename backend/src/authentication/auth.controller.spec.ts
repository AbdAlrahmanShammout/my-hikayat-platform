import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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

function createSampleSession(): AuthSession {
  return {
    user: createSampleUser(),
    accessToken: 'signed.jwt',
    expiresIn: '15m',
  };
}

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    createSession: jest.Mock;
    acceptAdminInvitation: jest.Mock;
  };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      createSession: jest.fn(),
      acceptAdminInvitation: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        JwtAuthGuard,
        LocalAuthGuard,
        RolesGuard,
      ],
    }).compile();
    authController = moduleRef.get(AuthController);
  });

  describe('register', () => {
    it('maps the request into a session response without leaking the password hash', async () => {
      mockAuthService.register.mockResolvedValue(createSampleSession());
      const actualResponse = await authController.register({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
      });
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
      });
      expect(actualResponse.accessToken).toBe('signed.jwt');
      expect(actualResponse.user.email).toBe('reader@example.com');
      expect(actualResponse.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('acceptAdminInvitation', () => {
    it('maps the token and password into a session response without leaking the password hash', async () => {
      mockAuthService.acceptAdminInvitation.mockResolvedValue({
        user: new UserEntity({
          ...createSampleUser(),
          email: 'new-admin@example.com',
          role: UserRole.ADMIN,
        }),
        accessToken: 'signed.jwt',
        expiresIn: '15m',
      });
      const actualResponse = await authController.acceptAdminInvitation({
        token: 'raw-token',
        password: 'correct-horse-battery',
      });
      expect(mockAuthService.acceptAdminInvitation).toHaveBeenCalledWith({
        token: 'raw-token',
        password: 'correct-horse-battery',
      });
      expect(actualResponse.accessToken).toBe('signed.jwt');
      expect(actualResponse.user.role).toBe(UserRole.ADMIN);
      expect(actualResponse.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('issues a session for the authenticated principal', () => {
      const currentUser: UserEntity = createSampleUser();
      mockAuthService.createSession.mockReturnValue(createSampleSession());
      const actualResponse = authController.login(currentUser);
      expect(mockAuthService.createSession).toHaveBeenCalledWith(currentUser);
      expect(actualResponse.tokenType).toBe('Bearer');
      expect(actualResponse.expiresIn).toBe('15m');
    });
  });

  describe('getCurrentUser', () => {
    it('projects the authenticated principal without the password hash', () => {
      const actualResponse = authController.getCurrentUser(createSampleUser());
      expect(actualResponse.email).toBe('reader@example.com');
      expect(actualResponse).not.toHaveProperty('passwordHash');
    });
  });
});
