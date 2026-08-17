import { describe, expect, it } from 'vitest';

import { adminBookRejectFormSchema } from '@/features/books/schemas/admin-book-reject-form.schema';

describe('adminBookRejectFormSchema', () => {
  it('accepts a non-empty reason', () => {
    const actualResult = adminBookRejectFormSchema.safeParse({
      reason: 'Cover art is unreadable at catalog size.',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank reason', () => {
    const actualResult = adminBookRejectFormSchema.safeParse({ reason: '   ' });
    expect(actualResult.success).toBe(false);
  });
});
