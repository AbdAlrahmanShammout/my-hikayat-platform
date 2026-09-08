type BookTitleLabelSource = {
  readonly bookId: number;
  readonly book?: {
    readonly title?: string;
  };
};

/**
 * Related book title when the API included it; otherwise the book id.
 */
export function formatBookTitleLabel(source: BookTitleLabelSource): string {
  if (source.book?.title !== undefined && source.book.title !== '') {
    return source.book.title;
  }
  return `Book #${String(source.bookId)}`;
}
