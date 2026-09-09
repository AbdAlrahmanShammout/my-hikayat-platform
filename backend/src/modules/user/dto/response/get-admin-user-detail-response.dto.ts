import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SubscriptionResponse } from '@/modules/subscription/dto/response/model/subscription.response';
import { AdminUserReadingProgressItemResponse } from '@/modules/user/dto/response/model/admin-user-reading-progress-item.response';
import { AdminUserSubscriptionPeriodResponse } from '@/modules/user/dto/response/model/admin-user-subscription-period.response';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';
import { AdminUserDetail } from '@/modules/user/defs/user-admin-detail-service.defs';

export class GetAdminUserDetailResponseDto {
  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;

  @ApiPropertyOptional({
    description: 'Current subscription row when one exists',
    type: () => SubscriptionResponse,
    nullable: true,
  })
  subscription: SubscriptionResponse | null;

  @ApiProperty({
    description:
      'Remaining time derived from existing period dates. Null remainingMs means no expiration.',
    type: () => AdminUserSubscriptionPeriodResponse,
  })
  subscriptionPeriod: AdminUserSubscriptionPeriodResponse;

  @ApiProperty({
    description: 'Saved reading progress ordered by last session, most recent first',
    type: () => [AdminUserReadingProgressItemResponse],
  })
  readingProgress: AdminUserReadingProgressItemResponse[];

  constructor(detail: AdminUserDetail) {
    this.user = new UserResponse(detail.user);
    this.subscription =
      detail.subscription === null ? null : new SubscriptionResponse(detail.subscription);
    this.subscriptionPeriod = new AdminUserSubscriptionPeriodResponse(detail.periodProgress);
    this.readingProgress = detail.readingItems.map(
      (item) => new AdminUserReadingProgressItemResponse(item),
    );
  }
}
