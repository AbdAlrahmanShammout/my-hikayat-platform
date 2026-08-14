import { CategoryEntity } from '@/modules/category/entity/category.entity';

export type CreateCategoryRepoInput = {
  readonly name: string;
  readonly slug: string;
  readonly categoryWeight: number;
};

export type UpdateCategoryRepoInput = {
  readonly id: number;
  readonly name?: string;
  readonly slug?: string;
  readonly categoryWeight?: number;
};

export type ListCategoriesRepoInput = {
  readonly limit: number;
  readonly offset: number;
};

export type CategoryPage = {
  readonly entities: CategoryEntity[];
  readonly total: number;
};
