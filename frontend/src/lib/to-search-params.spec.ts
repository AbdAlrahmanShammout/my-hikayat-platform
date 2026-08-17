import { describe, expect, it } from 'vitest';

import { toSearchParams } from '@/lib/to-search-params';

describe('toSearchParams', () => {
  it('returns an empty string when every value is omitted', () => {
    const actualResult: string = toSearchParams({ limit: undefined });
    expect(actualResult).toBe('');
  });

  it('encodes defined list paging fields', () => {
    const actualResult: string = toSearchParams({ limit: 1, offset: 0 });
    expect(actualResult).toBe('?limit=1&offset=0');
  });
});
