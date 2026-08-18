import { ApiProperty } from '@nestjs/swagger';

import { AuthorDashboardSummary } from '@/modules/monetization/defs/author-dashboard-summary-service.defs';

export class GetAuthorDashboardSummaryResponseDto {
  @ApiProperty({
    description: 'Non-deleted books owned by the authenticated user',
    example: 0,
  })
  totalBooks: number;

  @ApiProperty({
    description: 'Catalog-visible books owned by the authenticated user',
    example: 0,
  })
  publishedBooks: number;

  @ApiProperty({
    description: 'Owned books currently in review',
    example: 0,
  })
  pendingReviewBooks: number;

  @ApiProperty({
    description:
      'All-period active reading plus spread time in minutes for owned books, without extra rounding',
    example: 0,
  })
  totalReadingMinutes: number;

  @ApiProperty({
    description: 'All-period stored author earnings in integer cents for the authenticated owner',
    example: 0,
  })
  authorCents: number;

  constructor(summary: AuthorDashboardSummary) {
    this.totalBooks = summary.totalBooks;
    this.publishedBooks = summary.publishedBooks;
    this.pendingReviewBooks = summary.pendingReviewBooks;
    this.totalReadingMinutes = summary.totalReadingMinutes;
    this.authorCents = summary.authorCents;
  }
}
