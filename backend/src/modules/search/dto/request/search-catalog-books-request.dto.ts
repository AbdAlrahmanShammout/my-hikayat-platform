import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

function parseOptionalSearchText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized: string = value.trim().replace(/\s+/g, ' ');
  return normalized.length === 0 ? undefined : normalized;
}

export class SearchCatalogBooksRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of matching catalog books to return',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of matching catalog books to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against the catalog book title',
    example: 'Harbor Lights',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => parseOptionalSearchText(value))
  title?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against the source metadata creator/author',
    example: 'Jane Author',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => parseOptionalSearchText(value))
  author?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against the source metadata publisher',
    example: 'Harbor Press',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => parseOptionalSearchText(value))
  publisher?: string;
}
