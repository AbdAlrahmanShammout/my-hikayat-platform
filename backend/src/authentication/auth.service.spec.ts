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
    };
    mockJwtTokenService = { createToken: jest.fn() };
    mockJwtConfigService = { accessExpiresIn: '15m' };
    authService = new AuthService(
      mockUserService as unknown as UserService,
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
      });
      expect(mockHashString).toHaveBeenCalledWith('correct-horse-battery');
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: 'reader@example.com',
        passwordHash: 'hashed-password',
      });
      expect(mockJwtTokenService.createToken).toHaveBeenCalledWith({
        payload: { principalId: 1, role: UserRole.READER },
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualSession).toEqual({
        user: expectedUser,
        accessToken: 'signed.jwt',
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

  describe('verifyCredentials', () => {
    it('returns the user when email and password match', async () => {
      const expectedUser = createSampleUser();
      mockUserService.findUserByEmail.mockResolvedValue(expectedUser);
      mockCompareHashString.mockResolvedValue(true);
      const actualUser = await authService.verifyCredentials({
        email: 'reader@example.com',
        password: 'correct-horse-battery',
      });
      expect(actualUser).toBe(expectedUser);
    });
  });

  describe('createSession', () => {
    it('signs an access token for the given principal', () => {
      mockJwtTokenService.createToken.mockReturnValue('signed.jwt');
      const actualSession = authService.createSession(createSampleUser());
      expect(mockJwtTokenService.createToken).toHaveBeenCalledWith({
        payload: { principalId: 1, role: UserRole.READER },
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualSession.accessToken).toBe('signed.jwt');
      expect(actualSession.expiresIn).toBe('15m');
    });
  });
});
