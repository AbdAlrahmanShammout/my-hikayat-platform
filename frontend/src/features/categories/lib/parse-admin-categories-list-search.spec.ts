import { describe, expect, it } from 'vitest';

import { parseAdminCategoriesListSearch } from '@/features/categories/lib/parse-admin-categories-list-search';

describe('parseAdminCategoriesListSearch', () => {
  it('defaults to offset 0', () => {
    const actualSearch = parseAdminCategoriesListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ offset: 0 });
  });

  it('reads a valid offset', () => {
    const actualSearch = parseAdminCategoriesListSearch(new URLSearchParams('offset=20'));
    expect(actualSearch).toEqual({ offset: 20 });
  });
});
