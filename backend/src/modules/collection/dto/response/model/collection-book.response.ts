import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';

export class CollectionBookResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Owning collection id', example: 3 })
  collectionId: number;

  @ApiProperty({ description: 'Book id in this collection', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Zero-based editorial display order', example: 0 })
  displayOrder: number;

  constructor(entity: CollectionBookEntity) {
    super(entity);
    this.collectionId = entity.collectionId;
    this.bookId = entity.bookId;
    this.displayOrder = entity.displayOrder;
  }
}
