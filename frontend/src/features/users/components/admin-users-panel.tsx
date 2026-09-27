import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminUsersFilters } from '@/features/users/components/admin-users-filters';
import {
  AdminUsersTable,
  type AdminUsersTableAudience,
} from '@/features/users/components/admin-users-table';
import { AdminUsersTableSkeleton } from '@/features/users/components/admin-users-table-skeleton';
import { useAdminUsersList } from '@/features/users/hooks/use-admin-users-list';
import {
  parseAdminUsersListSearch,
  type AdminUsersListSearch,
} from '@/features/users/lib/parse-admin-users-list-search';
import { USER_ROLES } from '@/types/user-role';

type AdminUsersPanelProps = {
  readonly audience: AdminUsersTableAudience;
};

/**
 * Filterable GET /admin/users table. Admins and members are separate server queries.
 */
export function AdminUsersPanel({ audience }: AdminUsersPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminUsersListSearch = parseAdminUsersListSearch(searchParams);
  const usersQuery = useAdminUsersList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    email: listSearch.email,
    ...(audience === 'admins'
      ? { role: USER_ROLES.ADMIN }
      : { excludeRole: USER_ROLES.ADMIN }),
  });
  const replaceSearch = (nextSearch: AdminUsersListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminUsersFilters value={listSearch} onChange={replaceSearch} />
      {renderUsersPanelBody(usersQuery, listSearch, replaceSearch, audience)}
    </div>
  );
}

function renderUsersPanelBody(
  usersQuery: ReturnType<typeof useAdminUsersList>,
  listSearch: AdminUsersListSearch,
  replaceSearch: (nextSearch: AdminUsersListSearch) => void,
  audience: AdminUsersTableAudience,
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
          listSearch.email !== undefined
            ? 'Try a different exact email.'
            : 'GET /admin/users returned an empty list.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminUsersTable audience={audience} users={usersQuery.data.users} />
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

function buildListSearchParams(search: AdminUsersListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.email !== undefined) {
    params.set('email', search.email);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
