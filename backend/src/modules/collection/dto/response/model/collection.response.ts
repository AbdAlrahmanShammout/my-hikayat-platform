import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { CollectionBookResponse } from '@/modules/collection/dto/response/model/collection-book.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

export class CollectionResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Editorial collection title', example: 'Harbor Picks' })
  title: string;

  @ApiProperty({ type: () => [CollectionBookResponse] })
  items: CollectionBookResponse[];

  constructor(entity: CollectionEntity) {
    super(entity);
    this.title = entity.title;
    this.items = (entity.items ?? []).map((item) => new CollectionBookResponse(item));
  }
}
