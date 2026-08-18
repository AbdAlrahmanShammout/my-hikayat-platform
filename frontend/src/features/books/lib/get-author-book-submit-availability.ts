import type { components } from '@/generated/author';

export type AuthorBookSubmitAvailability = {
  readonly canSubmit: boolean;
  readonly submitDisabledReason: string | null;
};

type AuthorBookSubmitFields = Pick<components['schemas']['BookResponse'], 'publishingStatus'>;

const PENDING_OR_REJECTED_ONLY =
  'Available only while publishingStatus is pending or rejected.';

/**
 * UX hint from displayed publishingStatus. The API still owns the status machine.
 */
export function getAuthorBookSubmitAvailability(
  book: AuthorBookSubmitFields,
): AuthorBookSubmitAvailability {
  const canSubmit: boolean =
    book.publishingStatus === 'pending' || book.publishingStatus === 'rejected';
  return {
    canSubmit,
    submitDisabledReason: canSubmit ? null : PENDING_OR_REJECTED_ONLY,
  };
}
