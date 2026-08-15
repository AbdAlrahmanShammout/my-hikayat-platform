import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

import { PLATFORM_CUT_PERCENT_BOUNDS } from '@/modules/monetization/consts/platform-cut-percent-bounds.constant';

function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const parsed: Date = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const parsed: number = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class CreateRevenuePeriodRequestDto {
  @ApiProperty({
    description: 'Inclusive UTC start of the revenue period',
    example: '2098-08-01T00:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }: { value: unknown }) => parseDateValue(value))
  startsAt!: Date;

  @ApiProperty({
    description: 'Exclusive UTC end of the revenue period',
    example: '2098-09-01T00:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }: { value: unknown }) => parseDateValue(value))
  endsAt!: Date;

  @ApiPropertyOptional({
    description: 'Platform cut percent snapshotted for this period; defaults to current config',
    example: 30,
    minimum: PLATFORM_CUT_PERCENT_BOUNDS.min,
    maximum: PLATFORM_CUT_PERCENT_BOUNDS.max,
  })
  @IsOptional()
  @IsNumber()
  @Min(PLATFORM_CUT_PERCENT_BOUNDS.min)
  @Max(PLATFORM_CUT_PERCENT_BOUNDS.max)
  @Transform(({ value }: { value: unknown }) => parseOptionalNumber(value))
  platformCutPercent?: number;

  @ApiPropertyOptional({
    description: 'Period pool amount in cents',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalNumber(value))
  poolAmountCents?: number;
}
