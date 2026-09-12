import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { CollectionDiscovery } from '@/modules/collection/defs/collection-discovery.defs';

export class CollectionDiscoveryResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Editorial collection title', example: 'Harbor Picks' })
  title: string;

  @ApiProperty({
    description: 'Editorial collection description',
    example: 'Quiet seaside stories for evening reading.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Hex accent color for collection chrome, such as #1A6B4A',
    example: '#1A6B4A',
    nullable: true,
  })
  accentColor: string | null;

  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  constructor(discovery: CollectionDiscovery, books: readonly BookResponse[]) {
    super(discovery.collection);
    this.title = discovery.collection.title;
    this.description = discovery.collection.description;
    this.accentColor = discovery.collection.accentColor;
    this.books = [...books];
  }
}
