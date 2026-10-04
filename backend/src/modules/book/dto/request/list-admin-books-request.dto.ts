import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import { ADMIN_BOOK_LIST_MAX_LIMIT } from '@/modules/book/constants/admin-book-list.constant';
import { AdminBookSortField, AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';

const ADMIN_BOOK_KEYWORD_MIN_LENGTH = 2;

function parseOptionalIntQuery(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const parsed: number = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const values: unknown[] = Array.isArray(value) ? value : [value];
  const normalized: string[] = values
    .filter(
      (entry: unknown): entry is string | number =>
        typeof entry === 'string' || typeof entry === 'number',
    )
    .map((entry: string | number) => String(entry).trim())
    .filter((entry: string) => entry.length > 0);
  return normalized.length === 0 ? undefined : normalized;
}

function toOptionalIntArray(value: unknown): number[] | undefined {
  const values: string[] | undefined = toOptionalStringArray(value);
  if (values === undefined) {
    return undefined;
  }
  return values.map((entry: string) => Number.parseInt(entry, 10));
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return value as boolean;
}

export class ListAdminBooksRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of books to return',
    example: 20,
    minimum: 1,
    maximum: ADMIN_BOOK_LIST_MAX_LIMIT,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(ADMIN_BOOK_LIST_MAX_LIMIT)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({ description: 'Number of matching books to skip', example: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;

  @ApiPropertyOptional({
    description: 'Case-insensitive match on title, description, EPUB creator, or EPUB publisher',
    minLength: ADMIN_BOOK_KEYWORD_MIN_LENGTH,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(ADMIN_BOOK_KEYWORD_MIN_LENGTH)
  q?: string;

  @ApiPropertyOptional({ description: 'Match books in any of these categories', type: [Number] })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalIntArray(value))
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryId?: number[];

  @ApiPropertyOptional({ description: 'EPUB creator contains this text' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  authorName?: string;

  @ApiPropertyOptional({ description: 'EPUB publisher contains this text' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  publisherName?: string;

  @ApiPropertyOptional({
    description: 'Publisher account ids. A single id remains valid.',
    type: [Number],
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalIntArray(value))
  @IsInt({ each: true })
  @Min(1, { each: true })
  ownerId?: number[];

  @ApiPropertyOptional({ enum: BookType, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalStringArray(value))
  @IsEnum(BookType, { each: true })
  bookType?: BookType[];

  @ApiPropertyOptional({ enum: BookLayoutType, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalStringArray(value))
  @IsEnum(BookLayoutType, { each: true })
  layoutType?: BookLayoutType[];

  @ApiPropertyOptional({ enum: BookPublishingStatus, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalStringArray(value))
  @IsEnum(BookPublishingStatus, { each: true })
  publishingStatus?: BookPublishingStatus[];

  @ApiPropertyOptional({ enum: BookProcessingStatus, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalStringArray(value))
  @IsEnum(BookProcessingStatus, { each: true })
  processingStatus?: BookProcessingStatus[];

  @ApiPropertyOptional({ description: 'true keeps catalog-visible books. false keeps the rest.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalBoolean(value))
  @IsBoolean()
  catalogVisible?: boolean;

  @ApiPropertyOptional({ enum: AdminBookSortField, default: AdminBookSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(AdminBookSortField)
  sortBy?: AdminBookSortField;

  @ApiPropertyOptional({ enum: AdminSortOrder, default: AdminSortOrder.DESC })
  @IsOptional()
  @IsEnum(AdminSortOrder)
  sortOrder?: AdminSortOrder;
}
