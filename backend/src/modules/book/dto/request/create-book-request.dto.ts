import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { BookType } from '@/modules/book/enum/general.enum';

function parseOptionalIdArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return value;
  }
  const items: unknown[] = value as unknown[];
  return items.map((item: unknown) => {
    if (typeof item === 'number' && Number.isFinite(item)) {
      return item;
    }
    if (typeof item === 'string' && item !== '') {
      const parsed: number = Number.parseInt(item, 10);
      return Number.isFinite(parsed) ? parsed : item;
    }
    return item;
  });
}

function parseTitle(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim().replace(/\s+/g, ' ');
}

function parseDescription(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim();
}

export class CreateBookRequestDto {
  @ApiProperty({
    description: 'Book title',
    example: 'The Last Lighthouse',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTitle(value))
  title!: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A reflowable chapter book.',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseDescription(value))
  description!: string;

  @ApiProperty({
    description: 'Catalog book type',
    enum: BookType,
    example: BookType.STANDARD_CHAPTER,
  })
  @IsEnum(BookType)
  bookType!: BookType;

  @ApiPropertyOptional({
    description: 'Category ids assigned to the book',
    example: [2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Transform(({ value }: { value: unknown }) => parseOptionalIdArray(value))
  categoryIds?: number[];
}
