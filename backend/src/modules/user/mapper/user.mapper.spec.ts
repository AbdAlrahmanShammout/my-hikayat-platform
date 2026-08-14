import { UserRole } from '@/modules/user/enum/general.enum';
import { UserType } from '@/modules/user/types/user-details-schema.type';

import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  it('maps a persistence payload onto a UserEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: UserType = {
      id: 9,
      createdAt,
      updatedAt,
      deletedAt: null,
      email: 'author@example.com',
      passwordHash: 'hashed-password',
      role: 'author',
      isPublisher: true,
    };
    const actualEntity = UserMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(9);
    expect(actualEntity.email).toBe('author@example.com');
    expect(actualEntity.role).toBe(UserRole.AUTHOR);
    expect(actualEntity.isPublisher).toBe(true);
    expect(actualEntity.passwordHash).toBe('hashed-password');
  });
});
