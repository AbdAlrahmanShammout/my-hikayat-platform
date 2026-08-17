import { describe, expect, it } from 'vitest';

import { adminCategoryCreateFormSchema } from '@/features/categories/schemas/admin-category-create-form.schema';

describe('adminCategoryCreateFormSchema', () => {
  it('accepts a name with optional slug and weight omitted', () => {
    const actualResult = adminCategoryCreateFormSchema.safeParse({
      name: 'Graphic Novels',
      slug: '',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank name', () => {
    const actualResult = adminCategoryCreateFormSchema.safeParse({ name: '  ', slug: '' });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a non-positive weight', () => {
    const actualResult = adminCategoryCreateFormSchema.safeParse({
      name: 'Graphic Novels',
      slug: '',
      categoryWeight: 0,
    });
    expect(actualResult.success).toBe(false);
  });
});
