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

export class CreateReadingBookmarkRequestDto {
  @ApiPropertyOptional({
    description: 'Reflowable spine index of the bookmarked chapter or page',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spineIndex?: number;

  @ApiPropertyOptional({
    description: 'Reflowable scroll offset inside the bookmarked page',
    example: 640,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  scrollOffset?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout spread index of the bookmark',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spreadIndex?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout page number of the bookmark',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  pageNumber?: number;
}
