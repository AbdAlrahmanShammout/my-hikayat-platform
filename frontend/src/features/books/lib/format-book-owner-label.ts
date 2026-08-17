import type { components } from '@/generated/admin';

/**
 * Owner email when the API included it; otherwise the owner id.
 */
export function formatBookOwnerLabel(book: components['schemas']['BookResponse']): string {
  if (book.owner?.email !== undefined && book.owner.email !== '') {
    return book.owner.email;
  }
  return `User #${book.ownerId}`;
}
