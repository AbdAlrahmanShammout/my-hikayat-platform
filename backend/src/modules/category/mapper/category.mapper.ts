import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { CategoryType } from '@/modules/category/types/category-details-schema.type';

export class CategoryMapper {
  static toEntity(schema: CategoryType): CategoryEntity {
    return new CategoryEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      name: schema.name,
      slug: schema.slug,
      categoryWeight: Number(schema.categoryWeight),
    });
  }
}
