import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { CredentialThrottlerGuard } from '@/common/guards/credential-throttler.guard';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function createSampleSession(): AuthSession {
  return {
    user: new UserEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      email: 'reader@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.READER,
      isPublisher: false,
    }),
    accessToken: 'signed.jwt',
    expiresIn: '15m',
  };
}

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }, CredentialThrottlerGuard],
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
      expect(actualResponse).not.toHaveProperty('passwordHash');
      expect(actualResponse.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('maps matching credentials into a session response', async () => {
      mockAuthService.login.mockResolvedValue(createSampleSession());
      const actualResponse = await authController.login({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
      });
      expect(actualResponse.tokenType).toBe('Bearer');
      expect(actualResponse.expiresIn).toBe('15m');
    });
  });
});
