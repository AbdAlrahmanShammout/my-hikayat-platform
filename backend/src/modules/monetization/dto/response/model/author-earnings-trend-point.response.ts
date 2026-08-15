import { ApiProperty } from '@nestjs/swagger';

import { AuthorEarningsTrendPoint } from '@/modules/monetization/defs/author-analytics-service.defs';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

export class AuthorEarningsTrendPointResponse {
  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

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
    description: 'Author earnings in cents for this period',
    example: 7000,
  })
  authorCents: number;

  constructor(point: AuthorEarningsTrendPoint) {
    this.revenuePeriodId = point.period.id;
    this.startsAt = point.period.startsAt;
    this.endsAt = point.period.endsAt;
    this.status = point.period.status;
    this.authorCents = point.authorCents;
  }
}
