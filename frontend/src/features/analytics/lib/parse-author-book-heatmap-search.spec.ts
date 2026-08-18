import { describe, expect, it } from 'vitest';

import { parseAuthorBookHeatmapSearch } from '@/features/analytics/lib/parse-author-book-heatmap-search';

describe('parseAuthorBookHeatmapSearch', () => {
  it('defaults to no revenuePeriodId', () => {
    expect(parseAuthorBookHeatmapSearch(new URLSearchParams())).toEqual({
      revenuePeriodId: undefined,
    });
  });

  it('reads a positive revenuePeriodId', () => {
    const actualSearch = parseAuthorBookHeatmapSearch(new URLSearchParams('revenuePeriodId=4'));
    expect(actualSearch).toEqual({ revenuePeriodId: 4 });
  });
});
