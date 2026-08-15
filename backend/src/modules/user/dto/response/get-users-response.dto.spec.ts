import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { GetUsersResponseDto } from './get-users-response.dto';

describe('GetUsersResponseDto', () => {
  it('maps a page of users onto the list envelope', () => {
    const entity = new UserEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      email: 'reader@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.READER,
      isPublisher: false,
    });
    const actualResponse = new GetUsersResponseDto({ entities: [entity], total: 4 });
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.users).toHaveLength(1);
    expect(actualResponse.users[0].id).toBe(1);
    expect(actualResponse.users[0]).not.toHaveProperty('passwordHash');
  });
});
