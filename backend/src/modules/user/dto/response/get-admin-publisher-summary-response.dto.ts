import { ApiProperty } from '@nestjs/swagger';

import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { PublisherSummary } from '@/modules/user/publisher-directory.service';
import { UserRole } from '@/modules/user/enum/general.enum';

export class AdminPublisherStatusCountResponse {
  @ApiProperty({ enum: BookPublishingStatus })
  publishingStatus!: BookPublishingStatus;

  @ApiProperty()
  count!: number;
}

export class AdminPublisherRecentBookResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: BookPublishingStatus })
  publishingStatus!: BookPublishingStatus;

  @ApiProperty({ nullable: true, type: String })
  authorName!: string | null;

  @ApiProperty({ nullable: true, type: String })
  publisherName!: string | null;
}

export class GetAdminPublisherSummaryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true, type: String })
  displayName: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isPublisher: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  total: number;

  @ApiProperty()
  catalogVisible: number;

  @ApiProperty()
  unpublishedApprovedCount: number;

  @ApiProperty({ type: () => [AdminPublisherStatusCountResponse] })
  publishingStatusCounts: AdminPublisherStatusCountResponse[];

  @ApiProperty()
  lifetimeAuthorCents: number;

  @ApiProperty({ type: () => [AdminPublisherRecentBookResponse] })
  recentBooks: AdminPublisherRecentBookResponse[];

  @ApiProperty({ type: [Number] })
  revenuePeriodLinks: number[];

  constructor(summary: PublisherSummary) {
    this.id = summary.user.id;
    this.email = summary.user.email;
    this.displayName = summary.user.displayName;
    this.role = summary.user.role;
    this.isPublisher = summary.user.isPublisher;
    this.createdAt = summary.user.createdAt;
    this.total = summary.counts.total;
    this.catalogVisible = summary.counts.catalogVisible;
    this.unpublishedApprovedCount = summary.counts.unpublishedApprovedCount;
    this.publishingStatusCounts = summary.counts.publishingStatusCounts.map((row) => ({
      publishingStatus: row.publishingStatus,
      count: row.count,
    }));
    this.lifetimeAuthorCents = summary.lifetimeAuthorCents;
    this.recentBooks = summary.recentBooks.map((book) => ({ ...book }));
    this.revenuePeriodLinks = [...summary.counts.revenuePeriodIds];
  }
}
