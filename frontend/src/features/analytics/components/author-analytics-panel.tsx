import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { AUTHOR_LIST_PAGE_SIZE } from '@/config/author-list-page-size';
import { AuthorAnalyticsMetricsCard } from '@/features/analytics/components/author-analytics-metrics-card';
import { AuthorAnalyticsPeriodFilter } from '@/features/analytics/components/author-analytics-period-filter';
import { AuthorAnalyticsTable } from '@/features/analytics/components/author-analytics-table';
import { AuthorAnalyticsTableSkeleton } from '@/features/analytics/components/author-analytics-table-skeleton';
import { useAuthorAnalytics } from '@/features/analytics/hooks/use-author-analytics';
import { formatDurationMs } from '@/features/analytics/lib/format-duration-ms';
import {
  parseAuthorAnalyticsSearch,
  type AuthorAnalyticsSearch,
} from '@/features/analytics/lib/parse-author-analytics-search';
import { resolveAuthorAnalyticsPeriodId } from '@/features/analytics/lib/resolve-author-analytics-period-id';
import type { AuthorAnalyticsPeriodOption } from '@/features/analytics/lib/to-author-analytics-period-options';
import type { components } from '@/generated/author';

type AuthorAnalyticsPanelProps = {
  readonly periods: ReadonlyArray<AuthorAnalyticsPeriodOption>;
  readonly isPeriodsPending: boolean;
  readonly periodsError: Error | null;
  readonly onRetryPeriods: () => void;
};

/**
 * GET /author/analytics for one revenue period. Totals are displayed, not recomputed.
 */
export function AuthorAnalyticsPanel({
  periods,
  isPeriodsPending,
  periodsError,
  onRetryPeriods,
}: AuthorAnalyticsPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AuthorAnalyticsSearch = parseAuthorAnalyticsSearch(searchParams);
  const selectedPeriodId: number | undefined = resolveAuthorAnalyticsPeriodId({
    revenuePeriodId: listSearch.revenuePeriodId,
    points: periods,
  });
  const replaceSearch = (nextSearch: AuthorAnalyticsSearch): void => {
    setSearchParams(buildAnalyticsSearchParams(nextSearch), { replace: true });
  };
  if (isPeriodsPending) {
    return <AuthorAnalyticsTableSkeleton />;
  }
  if (periodsError !== null) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(periodsError)}
        onRetry={onRetryPeriods}
      />
    );
  }
  if (periods.length === 0) {
    return (
      <EmptyState
        title="No revenue periods yet"
        description="GET /author/earnings/trend returned an empty list."
      />
    );
  }
  return (
    <div className="space-y-6">
      <AuthorAnalyticsPeriodFilter
        periods={periods}
        value={selectedPeriodId}
        onChange={(revenuePeriodId: number) => {
          replaceSearch({ revenuePeriodId, offset: 0 });
        }}
      />
      <AuthorAnalyticsPeriodBody
        selectedPeriodId={selectedPeriodId}
        listSearch={listSearch}
        replaceSearch={replaceSearch}
      />
    </div>
  );
}

function AuthorAnalyticsPeriodBody({
  selectedPeriodId,
  listSearch,
  replaceSearch,
}: {
  readonly selectedPeriodId: number | undefined;
  readonly listSearch: AuthorAnalyticsSearch;
  readonly replaceSearch: (nextSearch: AuthorAnalyticsSearch) => void;
}): JSX.Element {
  const analyticsQuery = useAuthorAnalytics(
    selectedPeriodId === undefined
      ? null
      : {
          revenuePeriodId: selectedPeriodId,
          limit: AUTHOR_LIST_PAGE_SIZE,
          offset: listSearch.offset,
        },
  );
  if (selectedPeriodId === undefined) {
    return (
      <EmptyState
        title="Select a revenue period"
        description="GET /author/analytics requires revenuePeriodId."
      />
    );
  }
  if (analyticsQuery.isPending) {
    return <AuthorAnalyticsTableSkeleton />;
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
  const analytics: components['schemas']['GetAuthorAnalyticsResponseDto'] = analyticsQuery.data;
  return (
    <div className="space-y-4">
      <AuthorAnalyticsMetricsCard
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
          description="GET /author/analytics returned an empty list for this period."
        />
      ) : (
        <AuthorAnalyticsTable bookEngagements={analytics.bookEngagements} />
      )}
      <ListPagination
        offset={listSearch.offset}
        limit={AUTHOR_LIST_PAGE_SIZE}
        total={analytics.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ revenuePeriodId: selectedPeriodId, offset });
        }}
      />
    </div>
  );
}

function buildAnalyticsSearchParams(search: AuthorAnalyticsSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.revenuePeriodId !== undefined) {
    params.set('revenuePeriodId', String(search.revenuePeriodId));
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
