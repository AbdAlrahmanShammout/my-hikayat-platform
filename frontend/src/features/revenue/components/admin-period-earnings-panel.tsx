import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminPeriodEarningsTable } from '@/features/revenue/components/admin-period-earnings-table';
import { AdminPeriodMetricsCard } from '@/features/revenue/components/admin-period-metrics-card';
import { AdminPeriodRowsTableSkeleton } from '@/features/revenue/components/admin-period-rows-table-skeleton';
import { useAdminPeriodEarnings } from '@/features/revenue/hooks/use-admin-period-earnings';
import { formatPoolAmountLabel } from '@/features/revenue/lib/format-pool-amount-label';
import type { AdminRevenuePeriodDetailSearch } from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';

type AdminPeriodEarningsPanelProps = {
  readonly revenuePeriodId: number;
  readonly listSearch: AdminRevenuePeriodDetailSearch;
  readonly onSearchChange: (nextSearch: AdminRevenuePeriodDetailSearch) => void;
};

/**
 * GET /admin/revenue-periods/:id/earnings with server-side paging.
 */
export function AdminPeriodEarningsPanel({
  revenuePeriodId,
  listSearch,
  onSearchChange,
}: AdminPeriodEarningsPanelProps): JSX.Element {
  const earningsQuery = useAdminPeriodEarnings(revenuePeriodId, {
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    ownerId: listSearch.ownerId,
  });
  if (earningsQuery.isPending) {
    return <AdminPeriodRowsTableSkeleton />;
  }
  if (earningsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(earningsQuery.error)}
        onRetry={() => {
          void earningsQuery.refetch();
        }}
      />
    );
  }
  const earnings = earningsQuery.data;
  return (
    <div className="space-y-4">
      <AdminPeriodMetricsCard
        title="Earnings totals"
        description="authorCents and platformCutCents are backend values. Pool splits are not recomputed here."
        metrics={[
          { label: 'authorCents', value: formatPoolAmountLabel(earnings.authorCents) },
          { label: 'platformCutCents', value: formatPoolAmountLabel(earnings.platformCutCents) },
          { label: 'Rows', value: String(earnings.total) },
        ]}
      />
      {earnings.bookRevenues.length === 0 ? (
        <EmptyState
          title="No calculated earnings yet"
          description={
            listSearch.ownerId === undefined
              ? 'Calculate writes book shares for this period. Recalculating creates another audit row.'
              : 'No book revenues match this ownerId.'
          }
        />
      ) : (
        <AdminPeriodEarningsTable
          revenuePeriodId={revenuePeriodId}
          bookRevenues={earnings.bookRevenues}
        />
      )}
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={earnings.total}
        onOffsetChange={(offset: number) => {
          onSearchChange({ ...listSearch, offset });
        }}
      />
    </div>
  );
}
