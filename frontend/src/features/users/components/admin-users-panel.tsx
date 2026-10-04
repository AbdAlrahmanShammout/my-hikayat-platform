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
    q: listSearch.q,
    isPublisher: audience === 'members' ? listSearch.isPublisher : undefined,
    sortBy: listSearch.sortBy,
    sortOrder: listSearch.sortOrder,
    ...(audience === 'admins'
      ? { role: USER_ROLES.ADMIN }
      : { excludeRole: USER_ROLES.ADMIN }),
  });
  const replaceSearch = (nextSearch: AdminUsersListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminUsersFilters
        key={`${audience}-${serializeUsersSearch(listSearch)}`}
        audience={audience}
        value={listSearch}
        onChange={replaceSearch}
      />
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
          'Try another keyword, exact email, or publisher filter.'
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
  if (search.q !== undefined) {
    params.set('q', search.q);
  }
  if (search.isPublisher !== undefined) {
    params.set('isPublisher', String(search.isPublisher));
  }
  if (search.sortBy !== undefined) {
    params.set('sortBy', search.sortBy);
  }
  if (search.sortOrder !== undefined) {
    params.set('sortOrder', search.sortOrder);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}

function serializeUsersSearch(search: AdminUsersListSearch): string {
  return JSON.stringify(search);
}
