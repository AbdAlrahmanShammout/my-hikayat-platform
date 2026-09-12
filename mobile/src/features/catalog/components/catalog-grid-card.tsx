import type { JSX } from 'react';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { resolveCatalogBookAttribution } from '@/features/catalog/lib/resolve-catalog-book-attribution';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import { BookCard } from '@/ui/primitives/book-card';

type CatalogGridCardProps = {
  readonly book: CatalogBook;
  readonly onPress: (bookId: number) => void;
};

/**
 * Two-column catalog card used on Home New, Browse, and Newest.
 */
export function CatalogGridCard({ book, onPress }: CatalogGridCardProps): JSX.Element {
  const attribution = resolveCatalogBookAttribution(book);
  const cover = resolveCatalogCoverPresentation(book.cover);
  return (
    <BookCard
      title={book.title}
      authorName={attribution.authorLine}
      coverUri={cover.kind === 'image' ? cover.url : null}
      variant="grid"
      onPress={() => {
        onPress(book.id);
      }}
      accessibilityLabel={`Open ${book.title}`}
    />
  );
}
