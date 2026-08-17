import { describe, expect, it } from 'vitest';

import { parseAdminUsersListSearch } from '@/features/users/lib/parse-admin-users-list-search';

describe('parseAdminUsersListSearch', () => {
  it('defaults to unfiltered offset 0', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({
      role: undefined,
      isPublisher: undefined,
      email: undefined,
      offset: 0,
    });
  });

  it('reads role, publisher, email, and offset', () => {
    const inputParams = new URLSearchParams(
      'role=author&isPublisher=true&email=Author@Example.com&offset=20',
    );
    const actualSearch = parseAdminUsersListSearch(inputParams);
    expect(actualSearch).toEqual({
      role: 'author',
      isPublisher: true,
      email: 'author@example.com',
      offset: 20,
    });
  });

  it('ignores invalid role and email values', () => {
    const actualSearch = parseAdminUsersListSearch(
      new URLSearchParams('role=owner&email=not-an-email'),
    );
    expect(actualSearch.role).toBeUndefined();
    expect(actualSearch.email).toBeUndefined();
  });
});
