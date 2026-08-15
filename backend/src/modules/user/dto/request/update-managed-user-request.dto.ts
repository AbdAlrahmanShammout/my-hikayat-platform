import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { UserRole } from '@/modules/user/enum/general.enum';

export class UpdateManagedUserRequestDto {
  @ApiPropertyOptional({
    description: 'Replacement platform role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Whether the user should have publisher capability',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublisher?: boolean;
}
