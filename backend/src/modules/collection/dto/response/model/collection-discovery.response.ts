import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { CollectionDiscovery } from '@/modules/collection/defs/collection-discovery.defs';

export class CollectionDiscoveryResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Editorial collection title', example: 'Harbor Picks' })
  title: string;

  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  constructor(discovery: CollectionDiscovery, books: readonly BookResponse[]) {
    super(discovery.collection);
    this.title = discovery.collection.title;
    this.books = [...books];
  }
}
