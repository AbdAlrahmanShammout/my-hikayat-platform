import { describe, expect, it } from 'vitest';

import { parseAdminPlansListSearch } from '@/features/plans/lib/parse-admin-plans-list-search';

describe('parseAdminPlansListSearch', () => {
  it('defaults offset to zero', () => {
    expect(parseAdminPlansListSearch(new URLSearchParams())).toEqual({ offset: 0 });
  });

  it('parses a valid offset', () => {
    expect(parseAdminPlansListSearch(new URLSearchParams('offset=20'))).toEqual({
      offset: 20,
    });
  });

  it('rejects a negative offset', () => {
    expect(parseAdminPlansListSearch(new URLSearchParams('offset=-1'))).toEqual({
      offset: 0,
    });
  });
});
