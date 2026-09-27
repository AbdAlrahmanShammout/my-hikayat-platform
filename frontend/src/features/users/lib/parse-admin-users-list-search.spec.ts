import { describe, expect, it } from 'vitest';

import { parseAdminUsersListSearch } from '@/features/users/lib/parse-admin-users-list-search';

describe('parseAdminUsersListSearch', () => {
  it('defaults to the all tab at offset 0', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({
      tab: 'all',
      email: undefined,
      offset: 0,
    });
  });

  it('reads tab, email, and offset', () => {
    const inputParams = new URLSearchParams('tab=publisher&email=Author@Example.com&offset=20');
    const actualSearch = parseAdminUsersListSearch(inputParams);
    expect(actualSearch).toEqual({
      tab: 'publisher',
      email: 'author@example.com',
      offset: 20,
    });
  });

  it('maps a legacy admin role filter onto the admin tab', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams('role=admin'));
    expect(actualSearch.tab).toBe('admin');
  });

  it('maps a legacy publisher flag onto the publisher tab', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams('isPublisher=true'));
    expect(actualSearch.tab).toBe('publisher');
  });

  it('maps a legacy author role onto the publisher tab', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams('role=author'));
    expect(actualSearch.tab).toBe('publisher');
  });

  it('ignores an invalid tab and email', () => {
    const actualSearch = parseAdminUsersListSearch(
      new URLSearchParams('tab=owner&email=not-an-email'),
    );
    expect(actualSearch.tab).toBe('all');
    expect(actualSearch.email).toBeUndefined();
  });

  it('prefers an explicit tab over a legacy role', () => {
    const actualSearch = parseAdminUsersListSearch(new URLSearchParams('tab=reader&role=admin'));
    expect(actualSearch.tab).toBe('reader');
  });
});
