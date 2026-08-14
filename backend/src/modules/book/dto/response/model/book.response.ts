import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { CategoryResponse } from '@/modules/category/dto/response/model/category.response';

export class BookResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Book title', example: 'The Last Lighthouse' })
  title: string;

  @ApiProperty({ description: 'Book description', example: 'A reflowable chapter book.' })
  description: string;

  @ApiPropertyOptional({
    description: 'Detected EPUB layout; absent until processing completes',
    enum: BookLayoutType,
    example: BookLayoutType.REFLOWABLE,
    nullable: true,
  })
  layoutType: BookLayoutType | null;

  @ApiProperty({
    description: 'Catalog book type',
    enum: BookType,
    example: BookType.STANDARD_CHAPTER,
  })
  bookType: BookType;

  @ApiProperty({
    description: 'Publishing lifecycle status',
    enum: BookPublishingStatus,
    example: BookPublishingStatus.PENDING,
  })
  publishingStatus: BookPublishingStatus;

  @ApiPropertyOptional({
    description: 'When the book became available to readers',
    example: '2026-03-01T00:00:00.000Z',
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({ type: () => [CategoryResponse] })
  categories: CategoryResponse[];

  constructor(entity: BookEntity) {
    super(entity);
    this.title = entity.title;
    this.description = entity.description;
    this.layoutType = entity.layoutType;
    this.bookType = entity.bookType;
    this.publishingStatus = entity.publishingStatus;
    this.publishedAt = entity.publishedAt;
    this.categories = (entity.categories ?? []).map((category) => new CategoryResponse(category));
  }
}
