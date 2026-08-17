import { describe, expect, it } from 'vitest';

import { adminCategoryWeightFormSchema } from '@/features/categories/schemas/admin-category-weight-form.schema';

describe('adminCategoryWeightFormSchema', () => {
  it('accepts a weight greater than 0', () => {
    const actualResult = adminCategoryWeightFormSchema.safeParse({ categoryWeight: 1.25 });
    expect(actualResult.success).toBe(true);
  });

  it('rejects zero', () => {
    const actualResult = adminCategoryWeightFormSchema.safeParse({ categoryWeight: 0 });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a negative weight', () => {
    const actualResult = adminCategoryWeightFormSchema.safeParse({ categoryWeight: -1 });
    expect(actualResult.success).toBe(false);
  });
});
