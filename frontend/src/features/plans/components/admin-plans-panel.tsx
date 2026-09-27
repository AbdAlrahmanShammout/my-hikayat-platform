import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminPlansTable } from '@/features/plans/components/admin-plans-table';
import { AdminPlansTableSkeleton } from '@/features/plans/components/admin-plans-table-skeleton';
import { useAdminPlansList } from '@/features/plans/hooks/use-admin-plans-list';
import {
  parseAdminPlansListSearch,
  type AdminPlansListSearch,
} from '@/features/plans/lib/parse-admin-plans-list-search';

/**
 * Plan catalog list with paging. Create is a page-header dialog.
 */
export function AdminPlansPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminPlansListSearch = parseAdminPlansListSearch(searchParams);
  const plansQuery = useAdminPlansList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminPlansListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Create Products and Prices in the Stripe Dashboard, then register paid plans here with the
          Stripe price id. Free tier remains a local plan without a card.
        </AlertDescription>
      </Alert>
      {renderPlansPanelBody(plansQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderPlansPanelBody(
  plansQuery: ReturnType<typeof useAdminPlansList>,
  listSearch: AdminPlansListSearch,
  replaceSearch: (nextSearch: AdminPlansListSearch) => void,
): JSX.Element {
  if (plansQuery.isPending) {
    return <AdminPlansTableSkeleton />;
  }
  if (plansQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(plansQuery.error)}
        onRetry={() => {
          void plansQuery.refetch();
        }}
      />
    );
  }
  if (plansQuery.data.plans.length === 0) {
    return (
      <EmptyState
        title="No plans yet"
        description="GET /admin/plans returned an empty list. Use Create to register a paid plan."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminPlansTable plans={plansQuery.data.plans} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={plansQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminPlansListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
