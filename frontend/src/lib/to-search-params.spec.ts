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

  it('repeats array values and skips empty arrays', () => {
    const actualResult: string = toSearchParams({
      publishingStatus: ['approved', 'in_review'],
      categoryId: [],
    });
    expect(actualResult).toBe('?publishingStatus=approved&publishingStatus=in_review');
  });
});
