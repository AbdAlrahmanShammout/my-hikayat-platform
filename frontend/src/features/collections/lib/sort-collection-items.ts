import type { components } from '@/generated/admin';

/**
 * Sorts membership by displayOrder, then bookId, matching editorial order.
 */
export function sortCollectionItems(
  items: ReadonlyArray<components['schemas']['CollectionBookResponse']>,
): Array<components['schemas']['CollectionBookResponse']> {
  return [...items].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }
    return left.bookId - right.bookId;
  });
}
