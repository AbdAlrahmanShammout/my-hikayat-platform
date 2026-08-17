import { describe, expect, it } from 'vitest';

import { parseAdminRevenuePeriodsListSearch } from '@/features/revenue/lib/parse-admin-revenue-periods-list-search';

describe('parseAdminRevenuePeriodsListSearch', () => {
  it('defaults to offset 0', () => {
    const actualSearch = parseAdminRevenuePeriodsListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ offset: 0 });
  });

  it('reads a valid offset', () => {
    const actualSearch = parseAdminRevenuePeriodsListSearch(new URLSearchParams('offset=20'));
    expect(actualSearch).toEqual({ offset: 20 });
  });
});
