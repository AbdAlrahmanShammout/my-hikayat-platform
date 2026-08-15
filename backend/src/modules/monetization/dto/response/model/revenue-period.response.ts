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
    description: 'Whether the period is still open for pool updates',
    enum: RevenuePeriodStatus,
    example: RevenuePeriodStatus.OPEN,
  })
  status: RevenuePeriodStatus;

  @ApiProperty({
    description: 'Platform cut percent snapshotted for this period',
    example: 30,
  })
  platformCutPercent: number;

  @ApiPropertyOptional({
    description: 'Period pool amount in cents; absent until an admin sets it',
    example: 10000,
    nullable: true,
  })
  poolAmountCents: number | null;

  constructor(entity: RevenuePeriodEntity) {
    super(entity);
    this.startsAt = entity.startsAt;
    this.endsAt = entity.endsAt;
    this.status = entity.status;
    this.platformCutPercent = entity.platformCutPercent;
    this.poolAmountCents = entity.poolAmountCents;
  }
}
