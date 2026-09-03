export const CATALOG_PAGE_SIZE: number = 20;

export type ResolveNextCatalogPageOffsetInput = {
  readonly lastPageOffset: number;
  readonly lastPageBookCount: number;
  readonly total: number;
};

/**
 * Returns the next offset for catalog/search paging, or undefined at end.
 * Uses backend total + returned row count; does not invent client-side totals.
 */
export function resolveNextCatalogPageOffset(
  input: ResolveNextCatalogPageOffsetInput,
): number | undefined {
  if (input.lastPageBookCount <= 0) {
    return undefined;
  }
  const nextOffset: number = input.lastPageOffset + input.lastPageBookCount;
  if (nextOffset >= input.total) {
    return undefined;
  }
  return nextOffset;
}

export type CatalogBookPageLike = {
  readonly books: ReadonlyArray<{ readonly id: number }>;
  readonly total: number;
};

/**
 * Flattens infinite-query pages and drops duplicate ids if a page overlaps.
 */
export function flattenCatalogBookPages<T extends { readonly id: number }>(
  pages: ReadonlyArray<{ readonly books: ReadonlyArray<T> }>,
): T[] {
  const seenIds: Set<number> = new Set();
  const books: T[] = [];
  for (const page of pages) {
    for (const book of page.books) {
      if (seenIds.has(book.id)) {
        continue;
      }
      seenIds.add(book.id);
      books.push(book);
    }
  }
  return books;
}

/**
 * Formats loaded vs total so the UI does not imply all results are shown early.
 */
export function formatCatalogResultCountLabel(input: {
  readonly loadedCount: number;
  readonly total: number;
  readonly hasNextPage: boolean;
}): string {
  const bookWord: string = input.total === 1 ? 'book' : 'books';
  if (input.total <= 0) {
    return '';
  }
  if (!input.hasNextPage || input.loadedCount >= input.total) {
    return `${input.total} ${bookWord}`;
  }
  return `Showing ${input.loadedCount} of ${input.total} ${bookWord}`;
}
