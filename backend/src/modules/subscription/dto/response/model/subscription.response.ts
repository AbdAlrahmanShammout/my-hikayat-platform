import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { PlanResponse } from '@/modules/subscription/dto/response/model/plan.response';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

export class SubscriptionResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Subscriber user id', example: 5 })
  userId: number;

  @ApiProperty({ description: 'Assigned plan id', example: 2 })
  planId: number;

  @ApiProperty({
    description: 'Current subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'When this subscription row started',
    example: '2026-01-01T00:00:00.000Z',
  })
  startedAt: Date;

  @ApiPropertyOptional({
    description: 'Current paid period start; null on the free plan',
    example: '2026-08-01T00:00:00.000Z',
    nullable: true,
  })
  currentPeriodStart: Date | null;

  @ApiPropertyOptional({
    description: 'Current paid period end; null on the free plan',
    example: '2026-09-01T00:00:00.000Z',
    nullable: true,
  })
  currentPeriodEnd: Date | null;

  @ApiPropertyOptional({
    description: 'When the subscription was canceled; null while active',
    example: null,
    nullable: true,
  })
  canceledAt: Date | null;

  @ApiPropertyOptional({
    description: 'When paid monthly access first activated; null on the free plan',
    example: '2026-08-01T00:00:00.000Z',
    nullable: true,
  })
  activatedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Assigned plan projection when loaded',
    type: () => PlanResponse,
  })
  plan?: PlanResponse;

  constructor(entity: SubscriptionEntity) {
    super(entity);
    this.userId = entity.userId;
    this.planId = entity.planId;
    this.status = entity.status;
    this.startedAt = entity.startedAt;
    this.currentPeriodStart = entity.currentPeriodStart;
    this.currentPeriodEnd = entity.currentPeriodEnd;
    this.canceledAt = entity.canceledAt;
    this.activatedAt = entity.activatedAt;
    this.plan = entity.plan === undefined ? undefined : new PlanResponse(entity.plan);
  }
}
