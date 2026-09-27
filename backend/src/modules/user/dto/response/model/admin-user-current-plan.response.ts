import { ApiProperty } from '@nestjs/swagger';

import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { ManagedUserCurrentPlan } from '@/modules/user/defs/user-repository.defs';

export class AdminUserCurrentPlanResponse {
  @ApiProperty({ description: 'Display name of the subscribed plan', example: 'Monthly' })
  name: string;

  @ApiProperty({
    description: 'Whether the subscribed plan is the free plan or a paid plan',
    enum: PlanKind,
    example: PlanKind.MONTHLY_PAID,
  })
  kind: PlanKind;

  constructor(plan: ManagedUserCurrentPlan) {
    this.name = plan.name;
    this.kind = plan.kind;
  }
}
