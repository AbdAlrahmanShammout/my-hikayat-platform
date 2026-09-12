jest.mock('@/common/helpers/hash-string.helper', () => ({
  hashString: jest.fn(),
}));
jest.mock('@/common/helpers/compare-hash-string.helper', () => ({
  compareHashString: jest.fn(),
}));

import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';
import { compareHashString } from '@/common/helpers/compare-hash-string.helper';
import { hashString } from '@/common/helpers/hash-string.helper';
import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { AdminInvitationService } from '@/modules/user/admin-invitation.service';
import { AuthRefreshTokenService } from '@/modules/user/auth-refresh-token.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

import { AuthService } from './auth.service';

const mockHashString = hashString as jest.MockedFunction<typeof hashString>;
const mockCompareHashString = compareHashString as jest.MockedFunction<typeof compareHashString>;

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

describe('AuthService', () => {
  let mockUserService: {
    createUser: jest.Mock;
    findUserByEmail: jest.Mock;
    getUserById: jest.Mock;
  };
  let mockAdminInvitationService: { acceptInvitation: jest.Mock };
  let mockAuthRefreshTokenService: {
    issueForUser: jest.Mock;
    consumeAndRotate: jest.Mock;
    revokePresentedToken: jest.Mock;
  };
  let mockJwtTokenService: { createToken: jest.Mock };
  let mockJwtConfigService: { accessExpiresIn: string };
  let authService: AuthService;

  beforeEach(() => {
    mockHashString.mockReset();
    mockCompareHashString.mockReset();
    mockUserService = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      getUserById: jest.fn(),
    };
    mockAdminInvitationService = { acceptInvitation: jest.fn() };
    mockAuthRefreshTokenService = {
      issueForUser: jest.fn().mockResolvedValue({
        refreshToken: 'refresh.jwt',
        expiresAt: new Date('2026-10-01T00:00:00.000Z'),
      }),
      consumeAndRotate: jest.fn(),
      revokePresentedToken: jest.fn(),
    };
    mockJwtTokenService = { createToken: jest.fn() };
    mockJwtConfigService = { accessExpiresIn: '15m' };
    authService = new AuthService(
      mockUserService as unknown as UserService,
      mockAdminInvitationService as unknown as AdminInvitationService,
      mockAuthRefreshTokenService as unknown as AuthRefreshTokenService,
      mockJwtTokenService as unknown as JwtTokenService,
      mockJwtConfigService as unknown as JwtConfigService,
    );
  });

  describe('register', () => {
    it('hashes the password, creates a user, and issues an access token', async () => {
      const expectedUser = createSampleUser();
      mockHashString.mockResolvedValue('hashed-password');
      mockUserService.createUser.mockResolvedValue(expectedUser);
      mockJwtTokenService.createToken.mockReturnValue('signed.jwt');
      const actualSession = await authService.register({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
        displayName: 'Aisha Rahimah',
      });
      expect(mockHashString).toHaveBeenCalledWith('correct-horse-battery');
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: 'reader@example.com',
        passwordHash: 'hashed-password',
        displayName: 'Aisha Rahimah',
      });
      expect(mockJwtTokenService.createToken).toHaveBeenCalledWith({
        payload: { principalId: 1, role: UserRole.READER },
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualSession).toEqual({
        user: expectedUser,
        accessToken: 'signed.jwt',
        refreshToken: 'refresh.jwt',
        expiresIn: '15m',
      });
    });

    it('propagates an email conflict from the user service', async () => {
      mockHashString.mockResolvedValue('hashed-password');
      mockUserService.createUser.mockRejectedValue(
        new UserEmailConflictException('reader@example.com'),
      );
      await expect(
        authService.register({
          email: 'reader@example.com',
          password: 'correct-horse-battery',
          displayName: 'Aisha Rahimah',
        }),
      ).rejects.toBeInstanceOf(UserEmailConflictException);
    });
  });

  describe('login', () => {
    it('issues an access token when credentials match', async () => {
      const expectedUser = createSampleUser();
      mockUserService.findUserByEmail.mockResolvedValue(expectedUser);
      mockCompareHashString.mockResolvedValue(true);
      mockJwtTokenService.createToken.mockReturnValue('signed.jwt');
      const actualSession = await authService.login({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
      });
      expect(actualSession.accessToken).toBe('signed.jwt');
      expect(actualSession.refreshToken).toBe('refresh.jwt');
      expect(actualSession.user).toBe(expectedUser);
    });

    it('throws AuthenticationFailedException when the email is unknown', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      await expect(
        authService.login({
          email: 'missing@example.com',
          password: 'correct-horse-battery',
        }),
      ).rejects.toBeInstanceOf(AuthenticationFailedException);
      expect(mockCompareHashString).not.toHaveBeenCalled();
    });

    it('throws AuthenticationFailedException when the password is wrong', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(createSampleUser());
      mockCompareHashString.mockResolvedValue(false);
      await expect(
        authService.login({
          email: 'reader@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(AuthenticationFailedException);
    });
  });

  describe('acceptAdminInvitation', () => {
    it('hashes the password, accepts the invitation, and issues an access token', async () => {
      const expectedUser = new UserEntity({
        ...createSampleUser(),
        email: 'new-admin@example.com',
        role: UserRole.ADMIN,
      });
      mockHashString.mockResolvedValue('hashed-password');
      mockAdminInvitationService.acceptInvitation.mockResolvedValue(expectedUser);
      mockJwtTokenService.createToken.mockReturnValue('signed.jwt');
      const actualSession = await authService.acceptAdminInvitation({
        token: 'raw-token',
        password: 'correct-horse-battery',
      });
      expect(actualSession).toEqual({
        user: expectedUser,
        accessToken: 'signed.jwt',
        refreshToken: 'refresh.jwt',
        expiresIn: '15m',
      });
    });
  });

  describe('createSession', () => {
    it('signs access and refresh tokens for the given principal', async () => {
      mockJwtTokenService.createToken.mockReturnValue('signed.jwt');
      const actualSession = await authService.createSession(createSampleUser());
      expect(mockAuthRefreshTokenService.issueForUser).toHaveBeenCalledWith(1);
      expect(mockJwtTokenService.createToken).toHaveBeenCalledWith({
        payload: { principalId: 1, role: UserRole.READER },
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualSession.accessToken).toBe('signed.jwt');
      expect(actualSession.refreshToken).toBe('refresh.jwt');
      expect(actualSession.expiresIn).toBe('15m');
    });
  });

  describe('refreshSession', () => {
    it('rotates refresh and issues a new access session', async () => {
      const expectedUser = createSampleUser();
      mockAuthRefreshTokenService.consumeAndRotate.mockResolvedValue({
        userId: 1,
        refreshToken: 'next.refresh.jwt',
      });
      mockUserService.getUserById.mockResolvedValue(expectedUser);
      mockJwtTokenService.createToken.mockReturnValue('next.access.jwt');
      const actualSession = await authService.refreshSession('old.refresh.jwt');
      expect(actualSession).toEqual({
        user: expectedUser,
        accessToken: 'next.access.jwt',
        refreshToken: 'next.refresh.jwt',
        expiresIn: '15m',
      });
    });
  });

  describe('logout', () => {
    it('revokes the presented refresh token', async () => {
      await authService.logout('refresh.jwt');
      expect(mockAuthRefreshTokenService.revokePresentedToken).toHaveBeenCalledWith('refresh.jwt');
    });
  });
});
