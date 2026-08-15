import { ApiProperty } from '@nestjs/swagger';

import { RevenuePeriodPage } from '@/modules/monetization/defs/revenue-period-repository.defs';
import { RevenuePeriodResponse } from '@/modules/monetization/dto/response/model/revenue-period.response';

export class GetRevenuePeriodsResponseDto {
  @ApiProperty({ type: () => [RevenuePeriodResponse] })
  revenuePeriods: RevenuePeriodResponse[];

  @ApiProperty({
    description: 'Total revenue periods matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: RevenuePeriodPage) {
    this.revenuePeriods = page.entities.map((entity) => new RevenuePeriodResponse(entity));
    this.total = page.total;
  }
}
