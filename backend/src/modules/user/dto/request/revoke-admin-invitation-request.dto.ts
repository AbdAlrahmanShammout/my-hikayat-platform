import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevokeAdminInvitationRequestDto {
  @ApiPropertyOptional({
    description: 'Optional reason stored on the invitation and the audit row',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
