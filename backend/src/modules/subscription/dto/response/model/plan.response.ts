import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export class PlanResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Stable plan slug', example: 'monthly' })
  slug: string;

  @ApiProperty({ description: 'Display name', example: 'Monthly' })
  name: string;

  @ApiProperty({ description: 'Plan kind', enum: PlanKind, example: PlanKind.MONTHLY_PAID })
  kind: PlanKind;

  @ApiProperty({
    description: 'Billing interval; null for the free plan',
    enum: PlanInterval,
    example: PlanInterval.MONTH,
    nullable: true,
  })
  interval: PlanInterval | null;

  constructor(entity: PlanEntity) {
    super(entity);
    this.slug = entity.slug;
    this.name = entity.name;
    this.kind = entity.kind;
    this.interval = entity.interval;
  }
}
