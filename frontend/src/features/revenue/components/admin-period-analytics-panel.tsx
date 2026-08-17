import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminPeriodAnalyticsTable } from '@/features/revenue/components/admin-period-analytics-table';
import { AdminPeriodMetricsCard } from '@/features/revenue/components/admin-period-metrics-card';
import { AdminPeriodRowsTableSkeleton } from '@/features/revenue/components/admin-period-rows-table-skeleton';
import { useAdminPeriodAnalytics } from '@/features/revenue/hooks/use-admin-period-analytics';
import { formatDurationMs } from '@/features/revenue/lib/format-duration-ms';
import type { AdminRevenuePeriodDetailSearch } from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';

type AdminPeriodAnalyticsPanelProps = {
  readonly revenuePeriodId: number;
  readonly listSearch: AdminRevenuePeriodDetailSearch;
  readonly onSearchChange: (nextSearch: AdminRevenuePeriodDetailSearch) => void;
};

/**
 * GET /admin/revenue-periods/:id/analytics with server-side paging.
 */
export function AdminPeriodAnalyticsPanel({
  revenuePeriodId,
  listSearch,
  onSearchChange,
}: AdminPeriodAnalyticsPanelProps): JSX.Element {
  const analyticsQuery = useAdminPeriodAnalytics(revenuePeriodId, {
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    ownerId: listSearch.ownerId,
  });
  if (analyticsQuery.isPending) {
    return <AdminPeriodRowsTableSkeleton />;
  }
  if (analyticsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(analyticsQuery.error)}
        onRetry={() => {
          void analyticsQuery.refetch();
        }}
      />
    );
  }
  const analytics = analyticsQuery.data;
  return (
    <div className="space-y-4">
      <AdminPeriodMetricsCard
        title="Engagement totals"
        description="weightedEngagement and totalReadingMinutes come from the API. Visual scene time is not paid."
        metrics={[
          { label: 'totalReadingMinutes', value: String(analytics.totalReadingMinutes) },
          { label: 'totalWeightedEngagement', value: String(analytics.totalWeightedEngagement) },
          { label: 'totalActiveReadingMs', value: formatDurationMs(analytics.totalActiveReadingMs) },
          { label: 'totalActiveSpreadMs', value: formatDurationMs(analytics.totalActiveSpreadMs) },
          {
            label: 'totalVisualSceneTimeMs',
            value: formatDurationMs(analytics.totalVisualSceneTimeMs),
            hint: 'Not paid',
          },
          { label: 'Rows', value: String(analytics.total) },
        ]}
      />
      {analytics.bookEngagements.length === 0 ? (
        <EmptyState
          title="No engagement rows yet"
          description={
            listSearch.ownerId === undefined
              ? 'Refresh engagement to aggregate reading time for this period.'
              : 'No book engagements match this ownerId.'
          }
        />
      ) : (
        <AdminPeriodAnalyticsTable
          revenuePeriodId={revenuePeriodId}
          bookEngagements={analytics.bookEngagements}
        />
      )}
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={analytics.total}
        onOffsetChange={(offset: number) => {
          onSearchChange({ ...listSearch, offset });
        }}
      />
    </div>
  );
}
