export type CreateCategoryServiceInput = {
  readonly name: string;
  readonly slug?: string;
  readonly categoryWeight?: number;
};

export type UpdateCategoryServiceInput = {
  readonly id: number;
  readonly name?: string;
  readonly slug?: string;
  readonly categoryWeight?: number;
};

export type ListCategoriesServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};
