import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

import { PLATFORM_CUT_PERCENT_BOUNDS } from '@/modules/monetization/consts/platform-cut-percent-bounds.constant';

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

export class UpdateRevenuePeriodRequestDto {
  @ApiPropertyOptional({
    description: 'Platform cut percent; rejected after the period is closed',
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
