import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

function parseSearchQuery(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim().replace(/\s+/g, ' ');
}

export class SearchInBookRequestDto {
  @ApiProperty({
    description: 'Case-insensitive phrase to find inside the book',
    example: 'Harbor',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseSearchQuery(value))
  q!: string;

  @ApiPropertyOptional({
    description: 'Maximum number of matching hits to return',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of matching hits to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;
}
