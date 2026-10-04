import { describe, expect, it } from 'vitest';

import { parseAdminUsersListSearch } from '@/features/users/lib/parse-admin-users-list-search';

describe('parseAdminUsersListSearch', () => {
  it('defaults to offset 0', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({
      email: undefined,
      q: undefined,
      isPublisher: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      offset: 0,
    });
  });

  it('reads email and offset', () => {
    const inputParams = new URLSearchParams('email=Reader@Example.com&offset=20');
    const actualSearch = parseAdminUsersListSearch(inputParams);
    expect(actualSearch).toEqual({
      email: 'reader@example.com',
      q: undefined,
      isPublisher: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      offset: 20,
    });
  });

  it('ignores an invalid email and a one-character keyword', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams('email=not-an-email&q=a'));
    expect(actualSearch.email).toBeUndefined();
    expect(actualSearch.q).toBeUndefined();
  });
});
