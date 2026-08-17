import { describe, expect, it } from 'vitest';

import { parseAdminRevenuePeriodDetailSearch } from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';

describe('parseAdminRevenuePeriodDetailSearch', () => {
  it('defaults to the earnings tab at offset 0', () => {
    const actualSearch = parseAdminRevenuePeriodDetailSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ tab: 'earnings', ownerId: undefined, offset: 0 });
  });

  it('reads tab, ownerId, and offset', () => {
    const actualSearch = parseAdminRevenuePeriodDetailSearch(
      new URLSearchParams('tab=analytics&ownerId=3&offset=20'),
    );
    expect(actualSearch).toEqual({ tab: 'analytics', ownerId: 3, offset: 20 });
  });

  it('ignores an unknown tab and invalid ownerId', () => {
    const actualSearch = parseAdminRevenuePeriodDetailSearch(
      new URLSearchParams('tab=heatmap&ownerId=0'),
    );
    expect(actualSearch.tab).toBe('earnings');
    expect(actualSearch.ownerId).toBeUndefined();
  });
});
