import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

export class CategoryResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Display name', example: 'Picture Books' })
  name: string;

  @ApiProperty({ description: 'Stable taxonomy slug', example: 'picture-books' })
  slug: string;

  @ApiProperty({
    description: 'Configured weight applied to engagement when calculating author revenue',
    example: 1.25,
  })
  categoryWeight: number;

  constructor(entity: CategoryEntity) {
    super(entity);
    this.name = entity.name;
    this.slug = entity.slug;
    this.categoryWeight = entity.categoryWeight;
  }
}
