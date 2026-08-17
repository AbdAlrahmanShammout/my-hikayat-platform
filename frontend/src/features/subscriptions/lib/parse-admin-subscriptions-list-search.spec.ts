import { describe, expect, it } from 'vitest';

import { parseAdminSubscriptionsListSearch } from '@/features/subscriptions/lib/parse-admin-subscriptions-list-search';

describe('parseAdminSubscriptionsListSearch', () => {
  it('defaults to unfiltered offset 0', () => {
    const actualSearch = parseAdminSubscriptionsListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ status: undefined, userId: undefined, offset: 0 });
  });

  it('reads status, userId, and offset', () => {
    const inputParams = new URLSearchParams('status=canceled&userId=5&offset=20');
    const actualSearch = parseAdminSubscriptionsListSearch(inputParams);
    expect(actualSearch).toEqual({ status: 'canceled', userId: 5, offset: 20 });
  });

  it('ignores invalid status and userId values', () => {
    const actualSearch = parseAdminSubscriptionsListSearch(
      new URLSearchParams('status=expired&userId=0'),
    );
    expect(actualSearch.status).toBeUndefined();
    expect(actualSearch.userId).toBeUndefined();
  });
});
