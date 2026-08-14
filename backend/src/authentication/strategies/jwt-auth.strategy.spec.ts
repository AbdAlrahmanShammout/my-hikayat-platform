import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

import { JwtAuthStrategy } from './jwt-auth.strategy';

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

describe('JwtAuthStrategy', () => {
  let mockJwtTokenService: { verifyToken: jest.Mock };
  let mockUserService: { findUserById: jest.Mock };
  let jwtAuthStrategy: JwtAuthStrategy;

  beforeEach(() => {
    mockJwtTokenService = { verifyToken: jest.fn() };
    mockUserService = { findUserById: jest.fn() };
    jwtAuthStrategy = new JwtAuthStrategy(
      mockJwtTokenService as unknown as JwtTokenService,
      mockUserService as unknown as UserService,
    );
  });

  it('returns the principal when the token names an existing user', async () => {
    const expectedUser = createSampleUser();
    mockJwtTokenService.verifyToken.mockReturnValue({ principalId: 1, role: UserRole.READER });
    mockUserService.findUserById.mockResolvedValue(expectedUser);
    const actualUser = await jwtAuthStrategy.validate('signed.jwt');
    expect(mockJwtTokenService.verifyToken).toHaveBeenCalledWith({
      token: 'signed.jwt',
      purpose: JwtTokenPurpose.ACCESS,
    });
    expect(actualUser).toBe(expectedUser);
  });

  it('throws AuthenticationFailedException when the named user is missing', async () => {
    mockJwtTokenService.verifyToken.mockReturnValue({ principalId: 99, role: UserRole.READER });
    mockUserService.findUserById.mockResolvedValue(null);
    await expect(jwtAuthStrategy.validate('signed.jwt')).rejects.toBeInstanceOf(
      AuthenticationFailedException,
    );
  });

  it('throws AuthenticationFailedException when the loaded user id does not match the payload', async () => {
    mockJwtTokenService.verifyToken.mockReturnValue({ principalId: 99, role: UserRole.READER });
    mockUserService.findUserById.mockResolvedValue(createSampleUser());
    await expect(jwtAuthStrategy.validate('signed.jwt')).rejects.toBeInstanceOf(
      AuthenticationFailedException,
    );
  });
});
