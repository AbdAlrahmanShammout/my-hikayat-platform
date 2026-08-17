import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminCategoriesTable } from '@/features/categories/components/admin-categories-table';
import { AdminCategoriesTableSkeleton } from '@/features/categories/components/admin-categories-table-skeleton';
import { useAdminCategoriesList } from '@/features/categories/hooks/use-admin-categories-list';
import {
  parseAdminCategoriesListSearch,
  type AdminCategoriesListSearch,
} from '@/features/categories/lib/parse-admin-categories-list-search';

/**
 * Category list with inline categoryWeight edits and server-side paging.
 */
export function AdminCategoriesPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminCategoriesListSearch = parseAdminCategoriesListSearch(searchParams);
  const categoriesQuery = useAdminCategoriesList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminCategoriesListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Changing a weight does not rewrite historical payouts until a revenue period is
          recalculated.
        </AlertDescription>
      </Alert>
      {renderCategoriesPanelBody(categoriesQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderCategoriesPanelBody(
  categoriesQuery: ReturnType<typeof useAdminCategoriesList>,
  listSearch: AdminCategoriesListSearch,
  replaceSearch: (nextSearch: AdminCategoriesListSearch) => void,
): JSX.Element {
  if (categoriesQuery.isPending) {
    return <AdminCategoriesTableSkeleton />;
  }
  if (categoriesQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(categoriesQuery.error)}
        onRetry={() => {
          void categoriesQuery.refetch();
        }}
      />
    );
  }
  if (categoriesQuery.data.categories.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="GET /admin/categories returned an empty list. Create, rename, and delete are not available here."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminCategoriesTable categories={categoriesQuery.data.categories} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={categoriesQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminCategoriesListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
