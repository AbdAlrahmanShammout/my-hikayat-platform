import { ApiPropertyOptional } from '@nestjs/swagger';

import { AdminBookSortField, AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';

export class AdminBookAppliedFilters {
  @ApiPropertyOptional()
  q?: string;

  @ApiPropertyOptional({ type: [Number] })
  categoryId?: number[];

  @ApiPropertyOptional()
  authorName?: string;

  @ApiPropertyOptional()
  publisherName?: string;

  @ApiPropertyOptional({ type: [Number] })
  ownerId?: number[];

  @ApiPropertyOptional({ enum: BookType, isArray: true })
  bookType?: BookType[];

  @ApiPropertyOptional({ enum: BookLayoutType, isArray: true })
  layoutType?: BookLayoutType[];

  @ApiPropertyOptional({ enum: BookPublishingStatus, isArray: true })
  publishingStatus?: BookPublishingStatus[];

  @ApiPropertyOptional({ enum: BookProcessingStatus, isArray: true })
  processingStatus?: BookProcessingStatus[];

  @ApiPropertyOptional()
  catalogVisible?: boolean;

  @ApiPropertyOptional({ enum: AdminBookSortField })
  sortBy?: AdminBookSortField;

  @ApiPropertyOptional({ enum: AdminSortOrder })
  sortOrder?: AdminSortOrder;

  constructor(input: Partial<AdminBookAppliedFilters> = {}) {
    this.q = input.q;
    this.categoryId = input.categoryId === undefined ? undefined : [...input.categoryId];
    this.authorName = input.authorName;
    this.publisherName = input.publisherName;
    this.ownerId = input.ownerId === undefined ? undefined : [...input.ownerId];
    this.bookType = input.bookType === undefined ? undefined : [...input.bookType];
    this.layoutType = input.layoutType === undefined ? undefined : [...input.layoutType];
    this.publishingStatus =
      input.publishingStatus === undefined ? undefined : [...input.publishingStatus];
    this.processingStatus =
      input.processingStatus === undefined ? undefined : [...input.processingStatus];
    this.catalogVisible = input.catalogVisible;
    this.sortBy = input.sortBy;
    this.sortOrder = input.sortOrder;
  }
}
