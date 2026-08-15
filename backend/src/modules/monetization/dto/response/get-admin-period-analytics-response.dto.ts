import { ApiProperty } from '@nestjs/swagger';

import { AdminPeriodAnalyticsPage } from '@/modules/monetization/defs/admin-analytics-service.defs';
import { BookEngagementResponse } from '@/modules/monetization/dto/response/model/book-engagement.response';
import { RevenuePeriodResponse } from '@/modules/monetization/dto/response/model/revenue-period.response';

export class GetAdminPeriodAnalyticsResponseDto {
  @ApiProperty({ type: () => RevenuePeriodResponse })
  period: RevenuePeriodResponse;

  @ApiProperty({ type: () => [BookEngagementResponse] })
  bookEngagements: BookEngagementResponse[];

  @ApiProperty({
    description: 'Total book engagement rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Total active reflowable reading time in milliseconds',
    example: 120000,
  })
  totalActiveReadingMs: number;

  @ApiProperty({
    description: 'Total active fixed-layout spread time in milliseconds',
    example: 180000,
  })
  totalActiveSpreadMs: number;

  @ApiProperty({
    description: 'Total stored visual scene time in milliseconds',
    example: 90000,
  })
  totalVisualSceneTimeMs: number;

  @ApiProperty({
    description: 'Total weighted engagement minutes across matching books',
    example: 7,
  })
  totalWeightedEngagement: number;

  @ApiProperty({
    description: 'Total active reading plus spread time converted to minutes',
    example: 5,
  })
  totalReadingMinutes: number;

  constructor(result: AdminPeriodAnalyticsPage) {
    this.period = new RevenuePeriodResponse(result.period);
    this.bookEngagements = result.page.entities.map((entity) => new BookEngagementResponse(entity));
    this.total = result.page.total;
    this.totalActiveReadingMs = result.totalActiveReadingMs;
    this.totalActiveSpreadMs = result.totalActiveSpreadMs;
    this.totalVisualSceneTimeMs = result.totalVisualSceneTimeMs;
    this.totalWeightedEngagement = result.totalWeightedEngagement;
    this.totalReadingMinutes = result.totalReadingMinutes;
  }
}
