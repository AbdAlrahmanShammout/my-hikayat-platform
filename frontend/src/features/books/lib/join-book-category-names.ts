import type { components } from '@/generated/admin';

const EMPTY_CATEGORIES_LABEL = 'None';

/**
 * Joins assigned category names for table and summary display.
 */
export function joinBookCategoryNames(
  categories: ReadonlyArray<components['schemas']['CategoryResponse']>,
): string {
  if (categories.length === 0) {
    return EMPTY_CATEGORIES_LABEL;
  }
  return categories.map((category) => category.name).join(', ');
}
