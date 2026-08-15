import { ApiProperty } from '@nestjs/swagger';

import { UserPage } from '@/modules/user/defs/user-repository.defs';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';

export class GetUsersResponseDto {
  @ApiProperty({ type: () => [UserResponse] })
  users: UserResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: UserPage) {
    this.users = page.entities.map((entity) => new UserResponse(entity));
    this.total = page.total;
  }
}
