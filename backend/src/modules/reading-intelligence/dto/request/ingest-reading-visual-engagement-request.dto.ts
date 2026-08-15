import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

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

export class IngestReadingVisualEngagementRequestDto {
  @ApiProperty({
    description: 'Fixed-layout spread index viewed in this interval',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  spreadIndex!: number;

  @ApiProperty({
    description: 'Fixed-layout page number viewed in this interval',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  pageNumber!: number;

  @ApiProperty({
    description: 'Active time spent on the spread in this interval, in milliseconds',
    example: 15000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  activeDurationMs!: number;

  @ApiProperty({
    description: 'Visual scene time for the page or spread in this interval, in milliseconds',
    example: 12000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalInt(value))
  visualSceneTimeMs!: number;
}
