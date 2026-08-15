import { ApiProperty } from '@nestjs/swagger';

import { CollectionPage } from '@/modules/collection/defs/collection-repository.defs';
import { CollectionResponse } from '@/modules/collection/dto/response/model/collection.response';

export class GetCollectionsResponseDto {
  @ApiProperty({ type: () => [CollectionResponse] })
  collections: CollectionResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: CollectionPage) {
    this.collections = page.entities.map((entity) => new CollectionResponse(entity));
    this.total = page.total;
  }
}
