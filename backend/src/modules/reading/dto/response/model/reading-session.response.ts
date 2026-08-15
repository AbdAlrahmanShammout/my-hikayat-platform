import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';

export class ReadingSessionResponse extends BaseModelResponseDto {
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

  @ApiProperty({
    description: 'When the reading session started',
    example: '2026-08-15T02:00:00.000Z',
  })
  startedAt: Date;

  @ApiPropertyOptional({
    description: 'When the reading session ended; null while open',
    example: '2026-08-15T02:20:00.000Z',
    nullable: true,
  })
  endedAt: Date | null;

  @ApiProperty({ description: 'Cumulative active reading time in milliseconds', example: 900000 })
  activeDurationMs: number;

  @ApiProperty({ description: 'Cumulative idle time in milliseconds', example: 120000 })
  idleDurationMs: number;

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

  constructor(entity: ReadingSessionEntity) {
    super(entity);
    this.userId = entity.userId;
    this.bookId = entity.bookId;
    this.layoutType = entity.layoutType;
    this.startedAt = entity.startedAt;
    this.endedAt = entity.endedAt;
    this.activeDurationMs = entity.activeDurationMs;
    this.idleDurationMs = entity.idleDurationMs;
    this.spineIndex = entity.spineIndex;
    this.scrollOffset = entity.scrollOffset;
    this.spreadIndex = entity.spreadIndex;
    this.pageNumber = entity.pageNumber;
  }
}
