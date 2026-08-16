import { ApiProperty } from '@nestjs/swagger';

import { CategoryPage } from '@/modules/category/defs/category-repository.defs';
import { CategoryResponse } from '@/modules/category/dto/response/model/category.response';

export class GetCategoriesResponseDto {
  @ApiProperty({ type: () => [CategoryResponse] })
  categories: CategoryResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: CategoryPage) {
    this.categories = page.entities.map((entity) => new CategoryResponse(entity));
    this.total = page.total;
  }
}
