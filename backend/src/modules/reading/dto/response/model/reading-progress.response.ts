import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

export class ReadingProgressResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Reader user id', example: 7 })
  userId: number;

  @ApiProperty({ description: 'Book id', example: 8 })
  bookId: number;

  @ApiProperty({
    description: 'Layout that discriminates the stored position',
    enum: BookLayoutType,
    example: BookLayoutType.REFLOWABLE,
  })
  layoutType: BookLayoutType;

  @ApiPropertyOptional({
    description: 'Reflowable spine index; null for fixed-layout',
    example: 2,
    nullable: true,
  })
  spineIndex: number | null;

  @ApiPropertyOptional({
    description: 'Reflowable scroll offset; null for fixed-layout',
    example: 640,
    nullable: true,
  })
  scrollOffset: number | null;

  @ApiPropertyOptional({
    description: 'Fixed-layout spread index; null for reflowable',
    example: 1,
    nullable: true,
  })
  spreadIndex: number | null;

  @ApiPropertyOptional({
    description: 'Fixed-layout page number; null for reflowable',
    example: 3,
    nullable: true,
  })
  pageNumber: number | null;

  @ApiProperty({
    description: 'When this reading position was last saved',
    example: '2026-08-15T02:00:00.000Z',
  })
  lastSessionAt: Date;

  constructor(entity: ReadingProgressEntity) {
    super(entity);
    this.userId = entity.userId;
    this.bookId = entity.bookId;
    this.layoutType = entity.layoutType;
    this.spineIndex = entity.spineIndex;
    this.scrollOffset = entity.scrollOffset;
    this.spreadIndex = entity.spreadIndex;
    this.pageNumber = entity.pageNumber;
    this.lastSessionAt = entity.lastSessionAt;
  }
}
