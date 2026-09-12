import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

import {
  COLLECTION_ACCENT_COLOR_PATTERN,
  COLLECTION_DESCRIPTION_MAX_LENGTH,
} from '@/modules/collection/consts/collection-editorial.constant';

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

export class UpdateCollectionRequestDto {
  @ApiPropertyOptional({
    description: 'Editorial collection title',
    example: 'Harbor Picks',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTitle(value))
  title?: string;

  @ApiPropertyOptional({
    description: 'Editorial collection description. Empty string clears the field.',
    example: 'Quiet seaside stories for evening reading.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(COLLECTION_DESCRIPTION_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalEditorialText(value))
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Hex accent color for collection chrome. Empty string clears the field.',
    example: '#1A6B4A',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null && value !== '')
  @IsString()
  @Matches(COLLECTION_ACCENT_COLOR_PATTERN)
  @Transform(({ value }: { value: unknown }) => parseOptionalEditorialText(value))
  accentColor?: string | null;
}
