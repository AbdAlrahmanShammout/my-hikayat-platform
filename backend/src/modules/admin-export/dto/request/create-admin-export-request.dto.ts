import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

import { ADMIN_EXPORT_RESOURCES } from '@/modules/admin-export/admin-export.constants';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';

export class CreateAdminExportRequestDto {
  @ApiProperty({ enum: ADMIN_EXPORT_RESOURCES })
  @IsString()
  resource!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  selectedIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: AdminUserSortOrder })
  @IsOptional()
  @IsEnum(AdminUserSortOrder)
  sortOrder?: AdminUserSortOrder;
}

export class ListAdminExportsRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number.parseInt(value, 10) : value,
  )
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number.parseInt(value, 10) : value,
  )
  offset?: number;
}
