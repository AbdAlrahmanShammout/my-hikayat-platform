import { describe, expect, it } from 'vitest';

import { parseAuthorEarningsSearch } from '@/features/earnings/lib/parse-author-earnings-search';

describe('parseAuthorEarningsSearch', () => {
  it('defaults to no period and both offsets at 0', () => {
    expect(parseAuthorEarningsSearch(new URLSearchParams())).toEqual({
      revenuePeriodId: undefined,
      offset: 0,
      trendOffset: 0,
    });
  });

  it('reads revenuePeriodId, offset, and trendOffset', () => {
    const actualSearch = parseAuthorEarningsSearch(
      new URLSearchParams('revenuePeriodId=4&offset=20&trendOffset=40'),
    );
    expect(actualSearch).toEqual({ revenuePeriodId: 4, offset: 20, trendOffset: 40 });
  });
});
