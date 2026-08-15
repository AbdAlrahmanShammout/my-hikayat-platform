import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AdminPeriodEarningsPage } from '@/modules/monetization/defs/admin-analytics-service.defs';
import { BookRevenueResponse } from '@/modules/monetization/dto/response/model/book-revenue.response';
import { RevenuePeriodResponse } from '@/modules/monetization/dto/response/model/revenue-period.response';

export class GetAdminPeriodEarningsResponseDto {
  @ApiProperty({ type: () => RevenuePeriodResponse })
  period: RevenuePeriodResponse;

  @ApiProperty({ type: () => [BookRevenueResponse] })
  bookRevenues: BookRevenueResponse[];

  @ApiProperty({
    description: 'Total book revenue rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Total author earnings in cents for the matching rows',
    example: 7000,
  })
  authorCents: number;

  @ApiPropertyOptional({
    description:
      'Platform cut in cents from the snapshotted percent and pool; null before a pool is set',
    example: 3000,
    nullable: true,
  })
  platformCutCents: number | null;

  constructor(result: AdminPeriodEarningsPage) {
    this.period = new RevenuePeriodResponse(result.period);
    this.bookRevenues = result.page.entities.map((entity) => new BookRevenueResponse(entity));
    this.total = result.page.total;
    this.authorCents = result.authorCents;
    this.platformCutCents = result.platformCutCents;
  }
}
