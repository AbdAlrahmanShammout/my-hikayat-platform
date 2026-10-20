import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

export class RevenuePeriodResponse extends BaseModelResponseDto {
  @ApiProperty({
    description: 'Inclusive UTC start of the revenue period',
    example: '2026-08-01T00:00:00.000Z',
  })
  startsAt: Date;

  @ApiProperty({
    description: 'Exclusive UTC end of the revenue period',
    example: '2026-09-01T00:00:00.000Z',
  })
  endsAt: Date;

  @ApiProperty({
    description: 'Whether the period is still open',
    enum: RevenuePeriodStatus,
    example: RevenuePeriodStatus.OPEN,
  })
  status: RevenuePeriodStatus;

  @ApiPropertyOptional({
    description: 'Net subscription pool in cents, written when the period is calculated',
    example: 10000,
    nullable: true,
  })
  poolAmountCents: number | null;

  constructor(entity: RevenuePeriodEntity) {
    super(entity);
    this.startsAt = entity.startsAt;
    this.endsAt = entity.endsAt;
    this.status = entity.status;
    this.poolAmountCents = entity.poolAmountCents;
  }
}
