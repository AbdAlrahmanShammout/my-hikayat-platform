import { ApiProperty } from '@nestjs/swagger';

import { PublisherListPage } from '@/modules/user/defs/publisher-directory.defs';
import { UserRole } from '@/modules/user/enum/general.enum';

export class AdminPublisherResponse {
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
  bookCount: number;

  @ApiProperty()
  catalogVisibleBookCount: number;

  constructor(row: PublisherListPage['rows'][number]) {
    this.id = row.user.id;
    this.email = row.user.email;
    this.displayName = row.user.displayName;
    this.role = row.user.role;
    this.isPublisher = row.user.isPublisher;
    this.createdAt = row.user.createdAt;
    this.bookCount = row.counts.bookCount;
    this.catalogVisibleBookCount = row.counts.catalogVisibleBookCount;
  }
}

export class GetAdminPublishersResponseDto {
  @ApiProperty({ type: () => [AdminPublisherResponse] })
  publishers: AdminPublisherResponse[];

  @ApiProperty()
  total: number;

  constructor(page: PublisherListPage) {
    this.publishers = page.rows.map((row) => new AdminPublisherResponse(row));
    this.total = page.total;
  }
}
