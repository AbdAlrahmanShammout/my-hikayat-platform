import { describe, expect, it } from 'vitest';

import { parseAuthorAnalyticsSearch } from '@/features/analytics/lib/parse-author-analytics-search';

describe('parseAuthorAnalyticsSearch', () => {
  it('defaults to no period and offset 0', () => {
    expect(parseAuthorAnalyticsSearch(new URLSearchParams())).toEqual({
      revenuePeriodId: undefined,
      offset: 0,
    });
  });

  it('reads a positive revenuePeriodId and offset', () => {
    const actualSearch = parseAuthorAnalyticsSearch(
      new URLSearchParams('revenuePeriodId=4&offset=20'),
    );
    expect(actualSearch).toEqual({ revenuePeriodId: 4, offset: 20 });
  });
});
