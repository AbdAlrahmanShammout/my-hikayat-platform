import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminCollectionCreateForm } from '@/features/collections/components/admin-collection-create-form';
import { AdminCollectionsTable } from '@/features/collections/components/admin-collections-table';
import { AdminCollectionsTableSkeleton } from '@/features/collections/components/admin-collections-table-skeleton';
import { useAdminCollectionsList } from '@/features/collections/hooks/use-admin-collections-list';
import {
  parseAdminCollectionsListSearch,
  type AdminCollectionsListSearch,
} from '@/features/collections/lib/parse-admin-collections-list-search';

/**
 * Collection list with create form and server-side paging.
 */
export function AdminCollectionsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminCollectionsListSearch = parseAdminCollectionsListSearch(searchParams);
  const collectionsQuery = useAdminCollectionsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminCollectionsListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminCollectionCreateForm />
      {renderCollectionsPanelBody(collectionsQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderCollectionsPanelBody(
  collectionsQuery: ReturnType<typeof useAdminCollectionsList>,
  listSearch: AdminCollectionsListSearch,
  replaceSearch: (nextSearch: AdminCollectionsListSearch) => void,
): JSX.Element {
  if (collectionsQuery.isPending) {
    return <AdminCollectionsTableSkeleton />;
  }
  if (collectionsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(collectionsQuery.error)}
        onRetry={() => {
          void collectionsQuery.refetch();
        }}
      />
    );
  }
  if (collectionsQuery.data.collections.length === 0) {
    return (
      <EmptyState
        title="No collections yet"
        description="GET /admin/collections returned an empty list."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminCollectionsTable collections={collectionsQuery.data.collections} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={collectionsQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminCollectionsListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
