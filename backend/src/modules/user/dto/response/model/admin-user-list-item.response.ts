import { ApiProperty } from '@nestjs/swagger';

import { ManagedUserListItem } from '@/modules/user/defs/user-repository.defs';
import { AdminUserCurrentPlanResponse } from '@/modules/user/dto/response/model/admin-user-current-plan.response';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';

export class AdminUserListItemResponse extends UserResponse {
  @ApiProperty({
    description: 'Latest session token issue. Updates on sign-in and session refresh. Null when the account has never signed in.',
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-09-01T08:30:00.000Z',
  })
  lastSessionAt: Date | null;

  @ApiProperty({
    description: 'Current subscription plan. Null when the account has no plan.',
    type: () => AdminUserCurrentPlanResponse,
    nullable: true,
  })
  currentPlan: AdminUserCurrentPlanResponse | null;

  constructor(item: ManagedUserListItem) {
    super(item.user);
    this.lastSessionAt = item.lastSessionAt;
    this.currentPlan =
      item.currentPlan === null ? null : new AdminUserCurrentPlanResponse(item.currentPlan);
  }
}
