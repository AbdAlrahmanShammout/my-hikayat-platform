import { ApiProperty } from '@nestjs/swagger';

import { CollectionDiscoveryPage } from '@/modules/collection/defs/collection-discovery.defs';
import { CollectionDiscoveryResponse } from '@/modules/collection/dto/response/model/collection-discovery.response';

export class GetDiscoveryCollectionsResponseDto {
  @ApiProperty({ type: () => [CollectionDiscoveryResponse] })
  collections: CollectionDiscoveryResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: CollectionDiscoveryPage) {
    this.collections = page.entities.map((entity) => new CollectionDiscoveryResponse(entity));
    this.total = page.total;
  }
}
