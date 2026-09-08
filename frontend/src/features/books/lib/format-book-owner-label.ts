import { formatUserEmailLabel } from '@/lib/format-user-email-label';

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
  return formatUserEmailLabel({ userId: book.ownerId, user: book.owner });
}
