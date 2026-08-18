type CategoryOption = {
  readonly id: number;
};

/**
 * Keeps assigned categories visible in the edit form even if the lookup page omitted them.
 */
export function mergeCategoryOptions<T extends CategoryOption>(
  lookup: ReadonlyArray<T>,
  assigned: ReadonlyArray<T>,
): Array<T> {
  const merged: Array<T> = [...lookup];
  for (const category of assigned) {
    if (merged.some((item) => item.id === category.id)) {
      continue;
    }
    merged.push(category);
  }
  return merged;
}
