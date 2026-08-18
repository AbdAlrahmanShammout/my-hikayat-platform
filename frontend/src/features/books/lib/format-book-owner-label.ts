type BookOwnerLabelSource = {
  readonly ownerId: number;
  readonly owner?: {
    readonly email?: string;
  };
};

/**
 * Owner email when the API included it; otherwise the owner id.
 */
export function formatBookOwnerLabel(book: BookOwnerLabelSource): string {
  if (book.owner?.email !== undefined && book.owner.email !== '') {
    return book.owner.email;
  }
  return `User #${book.ownerId}`;
}
