import { ApiProperty } from '@nestjs/swagger';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { UserBookEngagement } from '@/modules/user/user-book-engagement.service';

export class AdminUserChapterEngagementResponse {
  @ApiProperty()
  spineIndex!: number;

  @ApiProperty({ nullable: true, type: String })
  title!: string | null;

  @ApiProperty()
  activeDurationMs!: number;
}

export class AdminUserSpreadEngagementResponse {
  @ApiProperty()
  spreadIndex!: number;

  @ApiProperty()
  pageNumber!: number;

  @ApiProperty()
  activeDurationMs!: number;

  @ApiProperty({ description: 'Unpaid visual scene time. Not included in paid reading minutes.' })
  visualSceneTimeMs!: number;
}

export class GetAdminUserBookEngagementResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  bookId: number;

  @ApiProperty({ enum: BookLayoutType, nullable: true })
  layoutType: BookLayoutType | null;

  @ApiProperty({ description: 'Paid session active duration for this user and book' })
  activeDurationMs: number;

  @ApiProperty({ type: () => [AdminUserChapterEngagementResponse] })
  chapters: AdminUserChapterEngagementResponse[];

  @ApiProperty({ type: () => [AdminUserSpreadEngagementResponse] })
  spreads: AdminUserSpreadEngagementResponse[];

  constructor(engagement: UserBookEngagement) {
    this.userId = engagement.userId;
    this.bookId = engagement.bookId;
    this.layoutType = engagement.layoutType;
    this.activeDurationMs = engagement.activeDurationMs;
    this.chapters = engagement.chapters.map((chapter) => ({ ...chapter }));
    this.spreads = engagement.spreads.map((spread) => ({ ...spread }));
  }
}
