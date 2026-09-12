import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, ValidateIf } from 'class-validator';

import {
  COLLECTION_ACCENT_COLOR_PATTERN,
  COLLECTION_DESCRIPTION_MAX_LENGTH,
} from '@/modules/collection/consts/collection-editorial.constant';

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

function parseOptionalEditorialText(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const normalized: string = value.trim().replace(/\s+/g, ' ');
  return normalized.length === 0 ? null : normalized;
}

export class CreateCollectionRequestDto {
  @ApiProperty({
    description: 'Editorial collection title',
    example: 'Harbor Picks',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTitle(value))
  title!: string;

  @ApiPropertyOptional({
    description: 'Editorial collection description',
    example: 'Quiet seaside stories for evening reading.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(COLLECTION_DESCRIPTION_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalEditorialText(value))
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Hex accent color for collection chrome',
    example: '#1A6B4A',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null && value !== '')
  @IsString()
  @Matches(COLLECTION_ACCENT_COLOR_PATTERN)
  @Transform(({ value }: { value: unknown }) => parseOptionalEditorialText(value))
  accentColor?: string | null;

  @ApiPropertyOptional({
    description: 'Book ids in editorial display order',
    example: [8, 9],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Transform(({ value }: { value: unknown }) => parseOptionalIdArray(value))
  bookIds?: number[];
}
