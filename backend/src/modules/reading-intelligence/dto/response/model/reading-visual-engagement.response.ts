import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';

export class ReadingVisualEngagementResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Reader user id', example: 7 })
  userId: number;

  @ApiProperty({ description: 'Book id', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Reading session id', example: 9 })
  sessionId: number;

  @ApiProperty({
    description: 'Layout of the book; visual engagement is fixed-layout only',
    enum: BookLayoutType,
    example: BookLayoutType.FIXED_LAYOUT,
  })
  layoutType: BookLayoutType;

  @ApiProperty({ description: 'Fixed-layout spread index', example: 1 })
  spreadIndex: number;

  @ApiProperty({ description: 'Fixed-layout page number', example: 3 })
  pageNumber: number;

  @ApiProperty({
    description: 'Cumulative active time spent on this spread, in milliseconds',
    example: 15000,
  })
  activeDurationMs: number;

  @ApiProperty({
    description: 'Cumulative visual scene time for this page or spread, in milliseconds',
    example: 12000,
  })
  visualSceneTimeMs: number;

  constructor(entity: ReadingVisualEngagementEntity) {
    super(entity);
    this.userId = entity.userId;
    this.bookId = entity.bookId;
    this.sessionId = entity.sessionId;
    this.layoutType = entity.layoutType;
    this.spreadIndex = entity.spreadIndex;
    this.pageNumber = entity.pageNumber;
    this.activeDurationMs = entity.activeDurationMs;
    this.visualSceneTimeMs = entity.visualSceneTimeMs;
  }
}
