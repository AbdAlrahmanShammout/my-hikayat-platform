import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';

export class BookEngagementResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

  @ApiProperty({ description: 'Book id', example: 8 })
  bookId: number;

  @ApiProperty({
    description: 'Layout used to choose the engagement metric',
    enum: BookLayoutType,
    example: BookLayoutType.REFLOWABLE,
  })
  layoutType: BookLayoutType;

  @ApiProperty({
    description: 'Active reflowable reading time in milliseconds',
    example: 120000,
  })
  activeReadingMs: number;

  @ApiProperty({
    description: 'Active fixed-layout spread time in milliseconds',
    example: 0,
  })
  activeSpreadMs: number;

  @ApiProperty({
    description: 'Stored visual scene time in milliseconds; not added into weighted engagement',
    example: 0,
  })
  visualSceneTimeMs: number;

  @ApiProperty({
    description: 'Category weight snapshotted for the period',
    example: 1.25,
  })
  categoryWeight: number;

  @ApiProperty({
    description: 'Weighted engagement minutes after applying category weight',
    example: 2.5,
  })
  weightedEngagement: number;

  constructor(entity: BookEngagementEntity) {
    super(entity);
    this.revenuePeriodId = entity.revenuePeriodId;
    this.bookId = entity.bookId;
    this.layoutType = entity.layoutType;
    this.activeReadingMs = entity.activeReadingMs;
    this.activeSpreadMs = entity.activeSpreadMs;
    this.visualSceneTimeMs = entity.visualSceneTimeMs;
    this.categoryWeight = entity.categoryWeight;
    this.weightedEngagement = entity.weightedEngagement;
  }
}
