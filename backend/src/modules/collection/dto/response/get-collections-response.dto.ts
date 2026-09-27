import { ApiProperty } from '@nestjs/swagger';

import { CollectionResponse } from '@/modules/collection/dto/response/model/collection.response';

export class GetCollectionsResponseDto {
  @ApiProperty({ type: () => [CollectionResponse] })
  collections: CollectionResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(collections: readonly CollectionResponse[], total: number) {
    this.collections = [...collections];
    this.total = total;
  }
}
