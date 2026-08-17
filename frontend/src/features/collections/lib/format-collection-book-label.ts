import type { components } from '@/generated/admin';

type CollectionBookLookup = Pick<
  components['schemas']['BookResponse'],
  'id' | 'title' | 'publishingStatus'
>;

/**
 * Labels a membership row. Unpublished books stay visible in admin.
 */
export function formatCollectionBookLabel(
  bookId: number,
  lookup: ReadonlyArray<CollectionBookLookup>,
): string {
  const book: CollectionBookLookup | undefined = lookup.find((item) => item.id === bookId);
  if (book === undefined) {
    return `Book #${bookId}`;
  }
  return book.title;
}
