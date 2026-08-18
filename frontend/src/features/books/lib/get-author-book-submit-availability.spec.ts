import { describe, expect, it } from 'vitest';

import { getAuthorBookSubmitAvailability } from '@/features/books/lib/get-author-book-submit-availability';

describe('getAuthorBookSubmitAvailability', () => {
  it('allows submit while publishingStatus is pending', () => {
    const actualAvailability = getAuthorBookSubmitAvailability({ publishingStatus: 'pending' });
    expect(actualAvailability.canSubmit).toBe(true);
    expect(actualAvailability.submitDisabledReason).toBeNull();
  });

  it('allows submit while publishingStatus is rejected', () => {
    const actualAvailability = getAuthorBookSubmitAvailability({ publishingStatus: 'rejected' });
    expect(actualAvailability.canSubmit).toBe(true);
    expect(actualAvailability.submitDisabledReason).toBeNull();
  });

  it('disables submit while publishingStatus is in_review', () => {
    const actualAvailability = getAuthorBookSubmitAvailability({ publishingStatus: 'in_review' });
    expect(actualAvailability.canSubmit).toBe(false);
    expect(actualAvailability.submitDisabledReason).toContain('pending or rejected');
  });

  it('disables submit while publishingStatus is approved', () => {
    const actualAvailability = getAuthorBookSubmitAvailability({ publishingStatus: 'approved' });
    expect(actualAvailability.canSubmit).toBe(false);
  });
});
