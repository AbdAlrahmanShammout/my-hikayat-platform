import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

import { AdminPublisherSortField } from '@/modules/user/enum/admin-publisher-sort-field.enum';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';

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

export class ListAdminPublishersRequestDto {
  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;

  @ApiPropertyOptional({ minLength: 2 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  q?: string;

  @ApiPropertyOptional({ enum: AdminPublisherSortField })
  @IsOptional()
  @IsEnum(AdminPublisherSortField)
  sortBy?: AdminPublisherSortField;

  @ApiPropertyOptional({ enum: AdminUserSortOrder })
  @IsOptional()
  @IsEnum(AdminUserSortOrder)
  sortOrder?: AdminUserSortOrder;
}

export class GetPublisherSummaryRequestDto {
  @ApiPropertyOptional({
    description: 'Limit lifetime author cents to one revenue period',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  revenuePeriodId?: number;
}
