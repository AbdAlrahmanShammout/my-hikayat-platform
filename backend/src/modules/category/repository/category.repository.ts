import { TransactionContext } from '@/common/base/transaction-context';
import {
  CategoryPage,
  CreateCategoryRepoInput,
  ListCategoriesRepoInput,
  UpdateCategoryRepoInput,
} from '@/modules/category/defs/category-repository.defs';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

export abstract class CategoryRepository {
  abstract create(
    input: CreateCategoryRepoInput,
    context?: TransactionContext,
  ): Promise<CategoryEntity>;
  abstract update(
    input: UpdateCategoryRepoInput,
    context?: TransactionContext,
  ): Promise<CategoryEntity>;
  abstract findById(id: number): Promise<CategoryEntity | null>;
  abstract findBySlug(slug: string): Promise<CategoryEntity | null>;
  abstract findByName(name: string): Promise<CategoryEntity | null>;
  abstract list(input: ListCategoriesRepoInput): Promise<CategoryPage>;
}
