import { SubscriptionPeriodProgress } from '@/modules/subscription/defs/subscription-period-progress.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { GetAdminUserDetailResponseDto } from './get-admin-user-detail-response.dto';

describe('GetAdminUserDetailResponseDto', () => {
  it('projects nested user, null subscription, and empty reading progress', () => {
    const inputUser = new UserEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      email: 'reader@example.com',
      passwordHash: 'secret-hash',
      role: UserRole.READER,
      isPublisher: false,
    });
    const inputPeriod: SubscriptionPeriodProgress = {
      periodStartedAt: null,
      periodEndsAt: null,
      remainingMs: null,
      elapsedPercent: null,
    };
    const actualResponse = new GetAdminUserDetailResponseDto({
      user: inputUser,
      subscription: null,
      periodProgress: inputPeriod,
      readingItems: [],
    });
    expect(actualResponse.user.email).toBe('reader@example.com');
    expect(actualResponse.user).not.toHaveProperty('passwordHash');
    expect(actualResponse.subscription).toBeNull();
    expect(actualResponse.subscriptionPeriod.remainingMs).toBeNull();
    expect(actualResponse.readingProgress).toEqual([]);
  });
});
