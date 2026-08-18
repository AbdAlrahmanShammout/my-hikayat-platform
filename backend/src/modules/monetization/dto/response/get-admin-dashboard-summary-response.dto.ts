import { ApiProperty } from '@nestjs/swagger';

import { AdminDashboardSummary } from '@/modules/monetization/defs/admin-dashboard-summary-service.defs';

export class GetAdminDashboardSummaryResponseDto {
  @ApiProperty({
    description: 'Non-deleted user count',
    example: 0,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Non-deleted users with publisher capability, including admin publishers',
    example: 0,
  })
  totalPublishers: number;

  @ApiProperty({
    description: 'Non-deleted book count across all publishing statuses',
    example: 0,
  })
  totalBooks: number;

  @ApiProperty({
    description: 'Catalog-visible book count',
    example: 0,
  })
  publishedBooks: number;

  @ApiProperty({
    description: 'Books currently in review',
    example: 0,
  })
  pendingReviewBooks: number;

  @ApiProperty({
    description: 'All-period active reading plus spread time in minutes, without extra rounding',
    example: 0,
  })
  totalReadingMinutes: number;

  constructor(summary: AdminDashboardSummary) {
    this.totalUsers = summary.totalUsers;
    this.totalPublishers = summary.totalPublishers;
    this.totalBooks = summary.totalBooks;
    this.publishedBooks = summary.publishedBooks;
    this.pendingReviewBooks = summary.pendingReviewBooks;
    this.totalReadingMinutes = summary.totalReadingMinutes;
  }
}
