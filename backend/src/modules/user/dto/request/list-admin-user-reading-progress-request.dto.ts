import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

import { ADMIN_USER_READING_PROGRESS_MAX_LIMIT } from '@/modules/user/consts/admin-user-reading-progress-limit.constant';

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

export class ListAdminUserReadingProgressRequestDto {
  @ApiPropertyOptional({ minimum: 1, maximum: ADMIN_USER_READING_PROGRESS_MAX_LIMIT, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(ADMIN_USER_READING_PROGRESS_MAX_LIMIT)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;
}
