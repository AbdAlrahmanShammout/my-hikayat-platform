import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminEnsureCurrentRevenuePeriod } from '@/features/revenue/components/admin-ensure-current-revenue-period';
import { AdminRevenuePeriodCreateForm } from '@/features/revenue/components/admin-revenue-period-create-form';
import { AdminRevenuePeriodsTable } from '@/features/revenue/components/admin-revenue-periods-table';
import { AdminRevenuePeriodsTableSkeleton } from '@/features/revenue/components/admin-revenue-periods-table-skeleton';
import { useAdminRevenuePeriodsList } from '@/features/revenue/hooks/use-admin-revenue-periods-list';
import {
  parseAdminRevenuePeriodsListSearch,
  type AdminRevenuePeriodsListSearch,
} from '@/features/revenue/lib/parse-admin-revenue-periods-list-search';

/**
 * Revenue-period list with create, current-month ensure, and server-side paging.
 */
export function AdminRevenuePeriodsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminRevenuePeriodsListSearch = parseAdminRevenuePeriodsListSearch(searchParams);
  const periodsQuery = useAdminRevenuePeriodsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminRevenuePeriodsListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Pool amount is admin-set integer cents. This screen does not derive the pool from Stripe.
        </AlertDescription>
      </Alert>
      <AdminEnsureCurrentRevenuePeriod />
      <AdminRevenuePeriodCreateForm />
      {renderRevenuePeriodsPanelBody(periodsQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderRevenuePeriodsPanelBody(
  periodsQuery: ReturnType<typeof useAdminRevenuePeriodsList>,
  listSearch: AdminRevenuePeriodsListSearch,
  replaceSearch: (nextSearch: AdminRevenuePeriodsListSearch) => void,
): JSX.Element {
  if (periodsQuery.isPending) {
    return <AdminRevenuePeriodsTableSkeleton />;
  }
  if (periodsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(periodsQuery.error)}
        onRetry={() => {
          void periodsQuery.refetch();
        }}
      />
    );
  }
  if (periodsQuery.data.revenuePeriods.length === 0) {
    return (
      <EmptyState
        title="No revenue periods yet"
        description="GET /admin/revenue-periods returned an empty list."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminRevenuePeriodsTable revenuePeriods={periodsQuery.data.revenuePeriods} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={periodsQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminRevenuePeriodsListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
