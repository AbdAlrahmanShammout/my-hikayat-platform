import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { AdminUserReadingProgressItem } from '@/modules/user/defs/user-admin-detail-service.defs';

export class AdminUserReadingProgressItemResponse {
  @ApiProperty({ type: () => BookResponse })
  book: BookResponse;

  @ApiProperty({
    description: 'Stored reading layout for this progress row',
    enum: BookLayoutType,
    example: BookLayoutType.REFLOWABLE,
  })
  layoutType: BookLayoutType;

  @ApiProperty({
    description:
      'Canonical progress percent (0–100). Reflowable uses chapter text length; fixed-layout uses pages or spreads.',
    example: 62,
  })
  contentProgressPercent: number;

  @ApiPropertyOptional({
    description: 'Chapter title, page, or spread label when structure is available',
    example: 'Chapter 9',
    nullable: true,
  })
  locationLabel: string | null;

  @ApiPropertyOptional({
    description: 'Reflowable resume spine index',
    example: 8,
    nullable: true,
  })
  spineIndex: number | null;

  @ApiPropertyOptional({
    description: 'Reflowable resume scroll offset',
    example: 120,
    nullable: true,
  })
  scrollOffset: number | null;

  @ApiPropertyOptional({
    description: 'Fixed-layout resume spread index',
    example: 3,
    nullable: true,
  })
  spreadIndex: number | null;

  @ApiPropertyOptional({
    description: 'Fixed-layout resume page number; not used for reflowable progress',
    example: 7,
    nullable: true,
  })
  pageNumber: number | null;

  @ApiProperty({
    description: 'Sum of stored reading-session activeDurationMs for this user and book',
    example: 720000,
  })
  activeDurationMs: number;

  @ApiProperty({
    description: 'When the user last had a reading session for this book',
    example: '2026-09-08T12:00:00.000Z',
  })
  lastSessionAt: Date;

  constructor(item: AdminUserReadingProgressItem) {
    this.book = new BookResponse(item.book, item.cover);
    this.layoutType = item.layoutType;
    this.contentProgressPercent = item.contentProgressPercent;
    this.locationLabel = item.locationLabel;
    this.spineIndex = item.spineIndex;
    this.scrollOffset = item.scrollOffset;
    this.spreadIndex = item.spreadIndex;
    this.pageNumber = item.pageNumber;
    this.activeDurationMs = item.activeDurationMs;
    this.lastSessionAt = item.lastSessionAt;
  }
}
