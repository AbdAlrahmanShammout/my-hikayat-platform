import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { UserResponse } from './user.response';

describe('UserResponse', () => {
  it('projects public user fields and omits the password hash', () => {
    const inputEntity = new UserEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      email: 'reader@example.com',
      passwordHash: 'secret-hash',
      role: UserRole.READER,
      isPublisher: false,
    });
    const actualResponse = new UserResponse(inputEntity);
    expect(actualResponse.id).toBe(1);
    expect(actualResponse.email).toBe('reader@example.com');
    expect(actualResponse.role).toBe(UserRole.READER);
    expect(actualResponse.isPublisher).toBe(false);
    expect(actualResponse).not.toHaveProperty('passwordHash');
  });
});
