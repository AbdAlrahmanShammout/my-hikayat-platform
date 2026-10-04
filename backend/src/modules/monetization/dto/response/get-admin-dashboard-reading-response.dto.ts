import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardReadingBookResponse {
  @ApiProperty()
  bookId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  ownerId!: number;

  @ApiProperty()
  activeReadingMs!: number;

  @ApiProperty()
  activeSpreadMs!: number;

  @ApiProperty({ description: 'Paid milliseconds divided by 60000. Visual scene time is excluded.' })
  readingMinutes!: number;
}

export class GetAdminDashboardReadingResponseDto {
  @ApiProperty({
    description:
      'Same BookEngagement minute total as the home KPI. Zero when no period has been aggregated.',
  })
  totalReadingMinutes: number;

  @ApiProperty({ type: () => [AdminDashboardReadingBookResponse] })
  bookEngagements: AdminDashboardReadingBookResponse[];

  @ApiProperty({ description: 'Number of books that have at least one engagement row' })
  total: number;

  constructor(input: {
    readonly totalReadingMinutes: number;
    readonly total: number;
    readonly bookEngagements: readonly AdminDashboardReadingBookResponse[];
  }) {
    this.totalReadingMinutes = input.totalReadingMinutes;
    this.bookEngagements = input.bookEngagements.map((row) => ({ ...row }));
    this.total = input.total;
  }
}
