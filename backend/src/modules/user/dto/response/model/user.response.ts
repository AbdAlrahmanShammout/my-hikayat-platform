import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

export class UserResponse extends BaseModelResponseDto {
  @ApiProperty({
    description: 'Normalized email address',
    example: 'reader@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({ description: 'Assigned platform role', enum: UserRole, example: UserRole.READER })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user has publisher capability', example: false })
  isPublisher: boolean;

  constructor(entity: UserEntity) {
    super(entity);
    this.email = entity.email;
    this.role = entity.role;
    this.isPublisher = entity.isPublisher;
  }
}
