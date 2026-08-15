import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

function parseOptionalInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const parsed: number = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class SaveReadingProgressRequestDto {
  @ApiPropertyOptional({
    description: 'Reflowable spine index of the last chapter or page',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spineIndex?: number;

  @ApiPropertyOptional({
    description: 'Reflowable scroll offset inside the last page',
    example: 640,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  scrollOffset?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout spread index last viewed',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spreadIndex?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout page number last viewed',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  pageNumber?: number;
}
