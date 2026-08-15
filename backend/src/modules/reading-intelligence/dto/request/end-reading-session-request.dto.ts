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

export class EndReadingSessionRequestDto {
  @ApiPropertyOptional({
    description: 'Final active reading milliseconds to add before closing',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  activeDurationMs?: number;

  @ApiPropertyOptional({
    description: 'Final idle milliseconds to add before closing',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  idleDurationMs?: number;

  @ApiPropertyOptional({
    description: 'Reflowable spine index when the session ends',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spineIndex?: number;

  @ApiPropertyOptional({
    description: 'Reflowable scroll offset when the session ends',
    example: 640,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  scrollOffset?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout spread index when the session ends',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spreadIndex?: number;

  @ApiPropertyOptional({
    description: 'Fixed-layout page number when the session ends',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  pageNumber?: number;
}
