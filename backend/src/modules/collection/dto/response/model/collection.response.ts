import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { CollectionBookResponse } from '@/modules/collection/dto/response/model/collection-book.response';
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

  @ApiProperty({
    description: 'Hex accent color for collection chrome, such as #1A6B4A',
    example: '#1A6B4A',
    nullable: true,
  })
  accentColor: string | null;

  @ApiProperty({ type: () => [CollectionBookResponse] })
  items: CollectionBookResponse[];

  constructor(entity: CollectionEntity) {
    super(entity);
    this.title = entity.title;
    this.description = entity.description;
    this.accentColor = entity.accentColor;
    this.items = (entity.items ?? []).map((item) => new CollectionBookResponse(item));
  }
}
