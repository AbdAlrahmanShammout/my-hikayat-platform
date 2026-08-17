import { describe, expect, it } from 'vitest';

import { getAdminBookActionAvailability } from '@/features/books/lib/get-admin-book-action-availability';

describe('getAdminBookActionAvailability', () => {
  it('allows approve and reject only for in-review ready books', () => {
    const actualAvailability = getAdminBookActionAvailability({
      publishingStatus: 'in_review',
      processingStatus: 'ready',
      publishedAt: null,
    });
    expect(actualAvailability.canApprove).toBe(true);
    expect(actualAvailability.canReject).toBe(true);
    expect(actualAvailability.canUnpublish).toBe(false);
    expect(actualAvailability.canRepublish).toBe(false);
  });

  it('disables approve when processing is not ready', () => {
    const actualAvailability = getAdminBookActionAvailability({
      publishingStatus: 'in_review',
      processingStatus: 'processing',
      publishedAt: null,
    });
    expect(actualAvailability.canApprove).toBe(false);
    expect(actualAvailability.approveDisabledReason).toContain('processingStatus');
    expect(actualAvailability.canReject).toBe(true);
  });

  it('allows unpublish only when approved and publishedAt is set', () => {
    const actualAvailability = getAdminBookActionAvailability({
      publishingStatus: 'approved',
      processingStatus: 'ready',
      publishedAt: '2026-08-17T01:00:00.000Z',
    });
    expect(actualAvailability.canUnpublish).toBe(true);
    expect(actualAvailability.canRepublish).toBe(false);
    expect(actualAvailability.canApprove).toBe(false);
  });

  it('allows republish only when approved, unpublished, and ready', () => {
    const actualAvailability = getAdminBookActionAvailability({
      publishingStatus: 'approved',
      processingStatus: 'ready',
      publishedAt: null,
    });
    expect(actualAvailability.canRepublish).toBe(true);
    expect(actualAvailability.canUnpublish).toBe(false);
  });
});
