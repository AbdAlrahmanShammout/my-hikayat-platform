import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { CollectionCover } from '@/modules/collection/defs/collection-cover.defs';
import { CollectionBookResponse } from '@/modules/collection/dto/response/model/collection-book.response';
import { CollectionCoverResponse } from '@/modules/collection/dto/response/model/collection-cover.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

export class CollectionResponse extends BaseModelResponseDto {
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

  @ApiProperty({ type: () => [CollectionBookResponse] })
  items: CollectionBookResponse[];

  constructor(entity: CollectionEntity, cover: CollectionCover | null = null) {
    super(entity);
    this.title = entity.title;
    this.description = entity.description;
    this.cover = cover === null ? null : new CollectionCoverResponse(cover);
    this.items = (entity.items ?? []).map((item) => new CollectionBookResponse(item));
  }
}
