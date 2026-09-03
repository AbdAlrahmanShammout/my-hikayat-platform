import { ApiProperty } from '@nestjs/swagger';

import { CollectionDiscoveryResponse } from '@/modules/collection/dto/response/model/collection-discovery.response';

export class GetDiscoveryCollectionsResponseDto {
  @ApiProperty({ type: () => [CollectionDiscoveryResponse] })
  collections: CollectionDiscoveryResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(collections: readonly CollectionDiscoveryResponse[], total: number) {
    this.collections = [...collections];
    this.total = total;
  }
}
