import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';

export class OfflineDownloadResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Reader who holds this offline download slot', example: 9 })
  userId: number;

  @ApiProperty({ description: 'Catalog book occupying the slot', example: 12 })
  bookId: number;

  constructor(entity: OfflineDownloadEntity) {
    super(entity);
    this.userId = entity.userId;
    this.bookId = entity.bookId;
  }
}
