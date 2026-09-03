import { buildPasswordFingerprint } from '@/authentication/helpers/password-fingerprint.helper';
import { PASSWORD_RESET_ACK_MESSAGE } from '@/authentication/consts/password-reset.constant';
import { AppConfigService } from '@/config/app/app-config.service';
import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtInvalidException } from '@/providers/jwt/exceptions/jwt-invalid.exception';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';
import { MailManagerService } from '@/providers/mail/mail-manager.service';

import { ForgetPasswordService } from './forget-password.service';

jest.mock('@/common/helpers/hash-string.helper', () => ({
  hashString: jest.fn(async () => 'new-hashed-password'),
}));

function createSampleUser(): UserEntity {
  return new UserEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

describe('ForgetPasswordService', () => {
  let mockUserService: {
    findUserByEmail: jest.Mock;
    getUserById: jest.Mock;
    updatePasswordHash: jest.Mock;
  };
  let mockJwtTokenService: { createToken: jest.Mock; verifyToken: jest.Mock };
  let mockJwtConfigService: { recoveryExpiresIn: string };
  let mockMailManagerService: { send: jest.Mock };
  let mockAppConfigService: { publicOrigin: string };
  let service: ForgetPasswordService;

  beforeEach(() => {
    mockUserService = {
      findUserByEmail: jest.fn(),
      getUserById: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    mockJwtTokenService = {
      createToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    mockJwtConfigService = { recoveryExpiresIn: '1h' };
    mockMailManagerService = { send: jest.fn().mockResolvedValue(undefined) };
    mockAppConfigService = { publicOrigin: 'http://localhost:5173' };
    service = new ForgetPasswordService(
      mockUserService as unknown as UserService,
      mockJwtTokenService as unknown as JwtTokenService,
      mockJwtConfigService as unknown as JwtConfigService,
      mockMailManagerService as unknown as MailManagerService,
      mockAppConfigService as unknown as AppConfigService,
    );
  });

  it('returns the same acknowledgement when the email is unknown', async () => {
    mockUserService.findUserByEmail.mockResolvedValue(null);
    const actual = await service.requestPasswordReset({ email: 'missing@example.com' });
    expect(actual).toBe(PASSWORD_RESET_ACK_MESSAGE);
    expect(mockMailManagerService.send).not.toHaveBeenCalled();
  });

  it('emails a recovery token when the account exists', async () => {
    const user = createSampleUser();
    mockUserService.findUserByEmail.mockResolvedValue(user);
    mockJwtTokenService.createToken.mockReturnValue('recovery.jwt');
    const actual = await service.requestPasswordReset({ email: user.email });
    expect(actual).toBe(PASSWORD_RESET_ACK_MESSAGE);
    expect(mockJwtTokenService.createToken).toHaveBeenCalledWith({
      payload: {
        principalId: user.id,
        passwordFingerprint: buildPasswordFingerprint(user.passwordHash),
      },
      purpose: JwtTokenPurpose.RECOVERY,
    });
    expect(mockMailManagerService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        text: expect.stringContaining('recovery.jwt'),
      }),
    );
  });

  it('updates the password when the recovery token is valid', async () => {
    const user = createSampleUser();
    mockJwtTokenService.verifyToken.mockReturnValue({
      principalId: user.id,
      passwordFingerprint: buildPasswordFingerprint(user.passwordHash),
    });
    mockUserService.getUserById.mockResolvedValue(user);
    mockUserService.updatePasswordHash.mockResolvedValue(user);
    const actual = await service.confirmPasswordReset({
      token: 'recovery.jwt',
      password: 'new-correct-horse',
    });
    expect(actual).toContain('password was updated');
    expect(mockUserService.updatePasswordHash).toHaveBeenCalledWith({
      userId: user.id,
      passwordHash: 'new-hashed-password',
    });
  });

  it('rejects a recovery token after the password fingerprint changed', async () => {
    const user = createSampleUser();
    mockJwtTokenService.verifyToken.mockReturnValue({
      principalId: user.id,
      passwordFingerprint: 'stale-fingerprint',
    });
    mockUserService.getUserById.mockResolvedValue(user);
    await expect(
      service.confirmPasswordReset({
        token: 'recovery.jwt',
        password: 'new-correct-horse',
      }),
    ).rejects.toBeInstanceOf(JwtInvalidException);
    expect(mockUserService.updatePasswordHash).not.toHaveBeenCalled();
  });
});
