import { describe, expect, it } from 'vitest';

import { adminCategoryRenameFormSchema } from '@/features/categories/schemas/admin-category-rename-form.schema';

describe('adminCategoryRenameFormSchema', () => {
  it('accepts a name and slug', () => {
    const actualResult = adminCategoryRenameFormSchema.safeParse({
      name: 'Graphic Novels',
      slug: 'graphic-novels',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank slug', () => {
    const actualResult = adminCategoryRenameFormSchema.safeParse({
      name: 'Graphic Novels',
      slug: '  ',
    });
    expect(actualResult.success).toBe(false);
  });
});
