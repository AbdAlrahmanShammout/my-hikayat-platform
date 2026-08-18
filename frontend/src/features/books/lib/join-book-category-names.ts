const EMPTY_CATEGORIES_LABEL = 'None';

type NamedCategory = {
  readonly name: string;
};

/**
 * Joins assigned category names for table and summary display.
 */
export function joinBookCategoryNames(categories: ReadonlyArray<NamedCategory>): string {
  if (categories.length === 0) {
    return EMPTY_CATEGORIES_LABEL;
  }
  return categories.map((category) => category.name).join(', ');
}
