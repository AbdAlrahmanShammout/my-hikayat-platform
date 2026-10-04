import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

import { AdminInvitationListStatus } from '@/modules/user/enum/admin-invitation-status.enum';

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

export class ListAdminInvitationsRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of invitations to return',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of matching invitations to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseOptionalIntQuery(value))
  offset?: number;

  @ApiPropertyOptional({
    description: 'Lifecycle filter. Omit to list pending unexpired invitations.',
    enum: AdminInvitationListStatus,
  })
  @IsOptional()
  @IsEnum(AdminInvitationListStatus)
  status?: AdminInvitationListStatus;

  @ApiPropertyOptional({ description: 'Exact email match', example: 'new-admin@example.com' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email?: string;
}
