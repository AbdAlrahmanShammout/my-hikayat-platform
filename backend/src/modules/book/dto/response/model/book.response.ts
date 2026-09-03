import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import {
  BookCoverInput,
  BookCoverResponse,
} from '@/modules/book/dto/response/model/book-cover.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryResponse } from '@/modules/category/dto/response/model/category.response';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';

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

  @ApiProperty({
    description: 'Source ingest processing status',
    enum: BookProcessingStatus,
    example: BookProcessingStatus.NOT_STARTED,
  })
  processingStatus: BookProcessingStatus;

  @ApiPropertyOptional({
    description: 'When the book became available to readers',
    example: '2026-03-01T00:00:00.000Z',
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({ description: 'Owning publisher user id', example: 4 })
  ownerId: number;

  @ApiPropertyOptional({ type: () => UserResponse })
  owner?: UserResponse;

  @ApiProperty({ type: () => [CategoryResponse] })
  categories: CategoryResponse[];

  @ApiPropertyOptional({
    description:
      'Catalog cover from the latest preview image. Null when no preview is uploaded. URL is signed and expires.',
    type: () => BookCoverResponse,
    nullable: true,
  })
  cover: BookCoverResponse | null;

  constructor(entity: BookEntity, cover: BookCoverInput | null = null) {
    super(entity);
    this.title = entity.title;
    this.description = entity.description;
    this.layoutType = entity.layoutType;
    this.bookType = entity.bookType;
    this.publishingStatus = entity.publishingStatus;
    this.processingStatus = entity.processingStatus;
    this.publishedAt = entity.publishedAt;
    this.ownerId = entity.ownerId;
    this.owner = entity.owner === undefined ? undefined : new UserResponse(entity.owner);
    this.categories = (entity.categories ?? []).map((category) => new CategoryResponse(category));
    this.cover = cover === null ? null : new BookCoverResponse(cover);
  }
}
