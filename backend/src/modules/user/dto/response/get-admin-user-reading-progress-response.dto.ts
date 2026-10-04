import { ApiProperty } from '@nestjs/swagger';

import { AdminUserReadingProgressItemResponse } from '@/modules/user/dto/response/model/admin-user-reading-progress-item.response';
import { AdminUserReadingProgressItem } from '@/modules/user/defs/user-admin-detail-service.defs';

export class GetAdminUserReadingProgressResponseDto {
  @ApiProperty({ type: () => [AdminUserReadingProgressItemResponse] })
  readingProgress: AdminUserReadingProgressItemResponse[];

  @ApiProperty()
  total: number;

  constructor(items: readonly AdminUserReadingProgressItem[], total: number) {
    this.readingProgress = items.map((item) => new AdminUserReadingProgressItemResponse(item));
    this.total = total;
  }
}
