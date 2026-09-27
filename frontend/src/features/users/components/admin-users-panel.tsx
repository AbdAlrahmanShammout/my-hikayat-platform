import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminUserListTabs } from '@/features/users/components/admin-user-list-tabs';
import { AdminUsersFilters } from '@/features/users/components/admin-users-filters';
import { AdminUsersTable } from '@/features/users/components/admin-users-table';
import { AdminUsersTableSkeleton } from '@/features/users/components/admin-users-table-skeleton';
import { useAdminUsersList } from '@/features/users/hooks/use-admin-users-list';
import { ADMIN_USER_LIST_TABS, type AdminUserListTab } from '@/features/users/lib/admin-user-list-tab';
import {
  parseAdminUsersListSearch,
  type AdminUsersListSearch,
} from '@/features/users/lib/parse-admin-users-list-search';
import { resolveAdminUsersListQuery } from '@/features/users/lib/resolve-admin-users-list-query';

/**
 * Filterable GET /admin/users table with server-side paging.
 */
export function AdminUsersPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminUsersListSearch = parseAdminUsersListSearch(searchParams);
  const listFilters = resolveAdminUsersListQuery(listSearch.tab);
  const usersQuery = useAdminUsersList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    role: listFilters.role,
    isPublisher: listFilters.isPublisher,
    email: listSearch.email,
  });
  const replaceSearch = (nextSearch: AdminUsersListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <AdminUserListTabs
      value={listSearch.tab}
      onChange={(tab: AdminUserListTab) => {
        replaceSearch({ ...listSearch, tab, offset: 0 });
      }}
    >
      <div className="space-y-6">
        <AdminUsersFilters value={listSearch} onChange={replaceSearch} />
        {renderUsersPanelBody(usersQuery, listSearch, replaceSearch)}
      </div>
    </AdminUserListTabs>
  );
}

function renderUsersPanelBody(
  usersQuery: ReturnType<typeof useAdminUsersList>,
  listSearch: AdminUsersListSearch,
  replaceSearch: (nextSearch: AdminUsersListSearch) => void,
): JSX.Element {
  if (usersQuery.isPending) {
    return <AdminUsersTableSkeleton />;
  }
  if (usersQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(usersQuery.error)}
        onRetry={() => {
          void usersQuery.refetch();
        }}
      />
    );
  }
  if (usersQuery.data.users.length === 0) {
    return (
      <EmptyState
        title="No users match this filter"
        description={
          hasActiveUserFilters(listSearch)
            ? 'Try another group, or a different exact email.'
            : 'GET /admin/users returned an empty list.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminUsersTable users={usersQuery.data.users} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={usersQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ ...listSearch, offset });
        }}
      />
    </div>
  );
}

function hasActiveUserFilters(search: AdminUsersListSearch): boolean {
  return search.tab !== ADMIN_USER_LIST_TABS.ALL || search.email !== undefined;
}

function buildListSearchParams(search: AdminUsersListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.tab !== ADMIN_USER_LIST_TABS.ALL) {
    params.set('tab', search.tab);
  }
  if (search.email !== undefined) {
    params.set('email', search.email);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
