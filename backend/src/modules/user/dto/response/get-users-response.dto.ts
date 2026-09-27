import { ApiProperty } from '@nestjs/swagger';

import { ManagedUserPage } from '@/modules/user/defs/user-repository.defs';
import { AdminUserListItemResponse } from '@/modules/user/dto/response/model/admin-user-list-item.response';

export class GetUsersResponseDto {
  @ApiProperty({ type: () => [AdminUserListItemResponse] })
  users: AdminUserListItemResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: ManagedUserPage) {
    this.users = page.items.map((item) => new AdminUserListItemResponse(item));
    this.total = page.total;
  }
}
