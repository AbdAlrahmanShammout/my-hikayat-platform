import { describe, expect, it } from 'vitest';

import { parseAdminCollectionsListSearch } from '@/features/collections/lib/parse-admin-collections-list-search';

describe('parseAdminCollectionsListSearch', () => {
  it('defaults to offset 0', () => {
    const actualSearch = parseAdminCollectionsListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ offset: 0 });
  });

  it('reads a valid offset', () => {
    const actualSearch = parseAdminCollectionsListSearch(new URLSearchParams('offset=20'));
    expect(actualSearch).toEqual({ offset: 20 });
  });
});
