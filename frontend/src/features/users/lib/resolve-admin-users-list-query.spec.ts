import { describe, expect, it } from 'vitest';

import { ADMIN_USER_LIST_TABS } from '@/features/users/lib/admin-user-list-tab';
import { resolveAdminUsersListQuery } from '@/features/users/lib/resolve-admin-users-list-query';

describe('resolveAdminUsersListQuery', () => {
  it('leaves all unfiltered', () => {
    expect(resolveAdminUsersListQuery(ADMIN_USER_LIST_TABS.ALL)).toEqual({
      role: undefined,
      isPublisher: undefined,
    });
  });

  it('filters admins by role', () => {
    expect(resolveAdminUsersListQuery(ADMIN_USER_LIST_TABS.ADMIN)).toEqual({
      role: 'admin',
      isPublisher: undefined,
    });
  });

  it('filters readers by role', () => {
    expect(resolveAdminUsersListQuery(ADMIN_USER_LIST_TABS.READER)).toEqual({
      role: 'reader',
      isPublisher: undefined,
    });
  });

  it('filters publishers by capability, including admin publishers', () => {
    expect(resolveAdminUsersListQuery(ADMIN_USER_LIST_TABS.PUBLISHER)).toEqual({
      role: undefined,
      isPublisher: true,
    });
  });
});
