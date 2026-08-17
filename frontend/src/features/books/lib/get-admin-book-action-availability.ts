import { hasWireInstant } from '@/lib/has-wire-instant';
import type { components } from '@/generated/admin';

export type AdminBookActionAvailability = {
  readonly canApprove: boolean;
  readonly approveDisabledReason: string | null;
  readonly canReject: boolean;
  readonly rejectDisabledReason: string | null;
  readonly canUnpublish: boolean;
  readonly unpublishDisabledReason: string | null;
  readonly canRepublish: boolean;
  readonly republishDisabledReason: string | null;
};

type AdminBookActionFields = Pick<
  components['schemas']['BookResponse'],
  'publishingStatus' | 'processingStatus' | 'publishedAt'
>;

const IN_REVIEW_ONLY = 'Available only while publishingStatus is in_review.';
const PROCESSING_NOT_READY = 'The API rejects this action until processingStatus is ready.';
const UNPUBLISH_REQUIRES_LIVE =
  'Available only for an approved book that currently has publishedAt set.';
const REPUBLISH_REQUIRES_APPROVED_UNPUBLISHED =
  'Available only for an approved book with publishedAt cleared.';

/**
 * UX hints from displayed book fields. Backend still enforces the real rules.
 */
export function getAdminBookActionAvailability(
  book: AdminBookActionFields,
): AdminBookActionAvailability {
  const isInReview: boolean = book.publishingStatus === 'in_review';
  const isApproved: boolean = book.publishingStatus === 'approved';
  const isProcessingReady: boolean = book.processingStatus === 'ready';
  const isCatalogVisible: boolean = isApproved && hasWireInstant(book.publishedAt);
  return {
    canApprove: isInReview && isProcessingReady,
    approveDisabledReason: resolveApproveDisabledReason(isInReview, isProcessingReady),
    canReject: isInReview,
    rejectDisabledReason: isInReview ? null : IN_REVIEW_ONLY,
    canUnpublish: isCatalogVisible,
    unpublishDisabledReason: isCatalogVisible ? null : UNPUBLISH_REQUIRES_LIVE,
    canRepublish: isApproved && !hasWireInstant(book.publishedAt) && isProcessingReady,
    republishDisabledReason: resolveRepublishDisabledReason(
      isApproved,
      hasWireInstant(book.publishedAt),
      isProcessingReady,
    ),
  };
}

function resolveApproveDisabledReason(isInReview: boolean, isProcessingReady: boolean): string | null {
  if (!isInReview) {
    return IN_REVIEW_ONLY;
  }
  if (!isProcessingReady) {
    return PROCESSING_NOT_READY;
  }
  return null;
}

function resolveRepublishDisabledReason(
  isApproved: boolean,
  hasPublishedAt: boolean,
  isProcessingReady: boolean,
): string | null {
  if (!isApproved || hasPublishedAt) {
    return REPUBLISH_REQUIRES_APPROVED_UNPUBLISHED;
  }
  if (!isProcessingReady) {
    return PROCESSING_NOT_READY;
  }
  return null;
}
