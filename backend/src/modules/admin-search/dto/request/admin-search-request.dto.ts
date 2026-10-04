import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import { ADMIN_SEARCH_TYPES } from '@/modules/admin-search/admin-search.service';
import type { AdminSearchType } from '@/modules/admin-search/admin-search.service';

export class AdminSearchRequestDto {
  @ApiProperty({ minLength: 2, maxLength: 80 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  q!: string;

  @ApiPropertyOptional({ enum: ADMIN_SEARCH_TYPES })
  @IsOptional()
  @IsIn(ADMIN_SEARCH_TYPES)
  type?: AdminSearchType;

  @ApiPropertyOptional({ minimum: 1, maximum: 25, default: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(25)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number.parseInt(value, 10) : value,
  )
  limit?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number.parseInt(value, 10) : value,
  )
  offset?: number;
}
