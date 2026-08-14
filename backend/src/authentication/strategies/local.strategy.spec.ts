import { AuthService } from '@/authentication/auth.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { LocalStrategy } from './local.strategy';

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

describe('LocalStrategy', () => {
  it('delegates credential verification to the authentication service', async () => {
    const expectedUser = createSampleUser();
    const mockAuthService = {
      verifyCredentials: jest.fn().mockResolvedValue(expectedUser),
    };
    const localStrategy = new LocalStrategy(mockAuthService as unknown as AuthService);
    const actualUser = await localStrategy.validate('reader@example.com', 'correct-horse-battery');
    expect(mockAuthService.verifyCredentials).toHaveBeenCalledWith({
      email: 'reader@example.com',
      password: 'correct-horse-battery',
    });
    expect(actualUser).toBe(expectedUser);
  });
});
