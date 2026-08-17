import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminSubscriptionsFilters } from '@/features/subscriptions/components/admin-subscriptions-filters';
import { AdminSubscriptionsTable } from '@/features/subscriptions/components/admin-subscriptions-table';
import { AdminSubscriptionsTableSkeleton } from '@/features/subscriptions/components/admin-subscriptions-table-skeleton';
import { useAdminSubscriptionsList } from '@/features/subscriptions/hooks/use-admin-subscriptions-list';
import {
  parseAdminSubscriptionsListSearch,
  type AdminSubscriptionsListSearch,
} from '@/features/subscriptions/lib/parse-admin-subscriptions-list-search';

/**
 * Filterable GET /admin/subscriptions table with server-side paging.
 */
export function AdminSubscriptionsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminSubscriptionsListSearch = parseAdminSubscriptionsListSearch(searchParams);
  const subscriptionsQuery = useAdminSubscriptionsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    status: listSearch.status,
    userId: listSearch.userId,
  });
  const replaceSearch = (nextSearch: AdminSubscriptionsListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminSubscriptionsFilters value={listSearch} onChange={replaceSearch} />
      {renderSubscriptionsPanelBody(subscriptionsQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderSubscriptionsPanelBody(
  subscriptionsQuery: ReturnType<typeof useAdminSubscriptionsList>,
  listSearch: AdminSubscriptionsListSearch,
  replaceSearch: (nextSearch: AdminSubscriptionsListSearch) => void,
): JSX.Element {
  if (subscriptionsQuery.isPending) {
    return <AdminSubscriptionsTableSkeleton />;
  }
  if (subscriptionsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(subscriptionsQuery.error)}
        onRetry={() => {
          void subscriptionsQuery.refetch();
        }}
      />
    );
  }
  if (subscriptionsQuery.data.subscriptions.length === 0) {
    return (
      <EmptyState
        title="No subscriptions match this filter"
        description={
          hasActiveSubscriptionFilters(listSearch)
            ? 'Try another status or user id.'
            : 'GET /admin/subscriptions returned an empty list.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminSubscriptionsTable subscriptions={subscriptionsQuery.data.subscriptions} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={subscriptionsQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ ...listSearch, offset });
        }}
      />
    </div>
  );
}

function hasActiveSubscriptionFilters(search: AdminSubscriptionsListSearch): boolean {
  return search.status !== undefined || search.userId !== undefined;
}

function buildListSearchParams(search: AdminSubscriptionsListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.status !== undefined) {
    params.set('status', search.status);
  }
  if (search.userId !== undefined) {
    params.set('userId', String(search.userId));
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
