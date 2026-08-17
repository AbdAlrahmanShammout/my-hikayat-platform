import { describe, expect, it } from 'vitest';

import { buildAdminCategoryRenameBody } from '@/features/categories/lib/build-admin-category-rename-body';
import type { components } from '@/generated/admin';

const sampleCategory: components['schemas']['CategoryResponse'] = {
  id: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fiction',
  slug: 'fiction',
  categoryWeight: 1,
};

describe('buildAdminCategoryRenameBody', () => {
  it('returns null when name and slug are unchanged', () => {
    const actualBody = buildAdminCategoryRenameBody({
      category: sampleCategory,
      values: { name: 'Fiction', slug: 'fiction' },
    });
    expect(actualBody).toBeNull();
  });

  it('sends only the changed name', () => {
    const actualBody = buildAdminCategoryRenameBody({
      category: sampleCategory,
      values: { name: 'Literary Fiction', slug: 'fiction' },
    });
    expect(actualBody).toEqual({ name: 'Literary Fiction' });
  });

  it('does not include categoryWeight', () => {
    const actualBody = buildAdminCategoryRenameBody({
      category: sampleCategory,
      values: { name: 'Fiction', slug: 'literary-fiction' },
    });
    expect(actualBody).toEqual({ slug: 'literary-fiction' });
    expect(actualBody).not.toHaveProperty('categoryWeight');
  });
});
