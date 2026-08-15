import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';

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

function parseOptionalCatalogSort(value: unknown): CatalogSort | undefined {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  return value as CatalogSort;
}

export class ListCatalogBooksRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of catalog books to return',
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
    description: 'Only include books in this category',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Fixed catalog ordering: newest by publishedAt, or popularity by reader progress',
    enum: CatalogSort,
    example: CatalogSort.NEWEST,
  })
  @IsOptional()
  @IsEnum(CatalogSort)
  @Transform(({ value }: { value: unknown }) => parseOptionalCatalogSort(value))
  sort?: CatalogSort;
}
