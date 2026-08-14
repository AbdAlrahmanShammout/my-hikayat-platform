import { UserRole } from '@/modules/user/enum/general.enum';

import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('implements Principal with identity, role, and publisher flag', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = new UserEntity({
      id: 4,
      createdAt,
      updatedAt,
      email: 'reader@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.READER,
      isPublisher: false,
    });
    expect(actualEntity.id).toBe(4);
    expect(actualEntity.role).toBe(UserRole.READER);
    expect(actualEntity.email).toBe('reader@example.com');
    expect(actualEntity.isPublisher).toBe(false);
    expect(actualEntity).not.toHaveProperty('statusCode');
  });
});
