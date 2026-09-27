import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { CollectionCover } from '@/modules/collection/defs/collection-cover.defs';
import { CollectionDiscovery } from '@/modules/collection/defs/collection-discovery.defs';
import { CollectionCoverResponse } from '@/modules/collection/dto/response/model/collection-cover.response';

export class CollectionDiscoveryResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Editorial collection title', example: 'Harbor Picks' })
  title: string;

  @ApiProperty({
    description: 'Editorial collection description',
    example: 'Quiet seaside stories for evening reading.',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description:
      'Collection cover image. Null when no cover is uploaded. URL is signed and expires.',
    type: () => CollectionCoverResponse,
    nullable: true,
  })
  cover: CollectionCoverResponse | null;

  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  constructor(
    discovery: CollectionDiscovery,
    books: readonly BookResponse[],
    cover: CollectionCover | null = null,
  ) {
    super(discovery.collection);
    this.title = discovery.collection.title;
    this.description = discovery.collection.description;
    this.cover = cover === null ? null : new CollectionCoverResponse(cover);
    this.books = [...books];
  }
}
