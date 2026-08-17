import type { components } from '@/generated/admin';

/**
 * Keeps assigned categories visible in the edit form even if the lookup page omitted them.
 */
export function mergeCategoryOptions(
  lookup: ReadonlyArray<components['schemas']['CategoryResponse']>,
  assigned: ReadonlyArray<components['schemas']['CategoryResponse']>,
): Array<components['schemas']['CategoryResponse']> {
  const merged: Array<components['schemas']['CategoryResponse']> = [...lookup];
  for (const category of assigned) {
    if (merged.some((item) => item.id === category.id)) {
      continue;
    }
    merged.push(category);
  }
  return merged;
}
