import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

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

export class ListAuditLogsRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of audit entries to return',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of matching audit entries to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;

  @ApiPropertyOptional({
    description: 'Only include entries performed by this user',
    example: 9,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  actorUserId?: number;

  @ApiPropertyOptional({
    description: 'Only include this action',
    enum: AuditAction,
    example: AuditAction.BOOK_APPROVED,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Only include this subject type',
    enum: AuditSubjectType,
    example: AuditSubjectType.BOOK,
  })
  @IsOptional()
  @IsEnum(AuditSubjectType)
  subjectType?: AuditSubjectType;

  @ApiPropertyOptional({
    description: 'Only include this subject id',
    example: 8,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  subjectId?: number;
}
