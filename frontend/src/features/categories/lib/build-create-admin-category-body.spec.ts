import { describe, expect, it } from 'vitest';

import { buildCreateAdminCategoryBody } from '@/features/categories/lib/build-create-admin-category-body';

describe('buildCreateAdminCategoryBody', () => {
  it('sends only the name when slug and weight are blank', () => {
    const actualBody = buildCreateAdminCategoryBody({
      name: 'Graphic Novels',
      slug: '  ',
    });
    expect(actualBody).toEqual({ name: 'Graphic Novels' });
  });

  it('includes slug and weight when the form provides them', () => {
    const actualBody = buildCreateAdminCategoryBody({
      name: 'Graphic Novels',
      slug: 'graphic-novels',
      categoryWeight: 1.25,
    });
    expect(actualBody).toEqual({
      name: 'Graphic Novels',
      slug: 'graphic-novels',
      categoryWeight: 1.25,
    });
  });
});
