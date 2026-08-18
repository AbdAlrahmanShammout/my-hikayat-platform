import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AUTHOR_LIST_PAGE_SIZE } from '@/config/author-list-page-size';
import { AuthorEarningsMetricsCard } from '@/features/earnings/components/author-earnings-metrics-card';
import { AuthorEarningsTable } from '@/features/earnings/components/author-earnings-table';
import { AuthorEarningsTableSkeleton } from '@/features/earnings/components/author-earnings-table-skeleton';
import { AuthorEarningsTrendTable } from '@/features/earnings/components/author-earnings-trend-table';
import { useAuthorEarnings } from '@/features/earnings/hooks/use-author-earnings';
import { useAuthorEarningsTrend } from '@/features/earnings/hooks/use-author-earnings-trend';
import { formatAuthorCentsLabel } from '@/features/earnings/lib/format-author-cents-label';
import {
  parseAuthorEarningsSearch,
  type AuthorEarningsSearch,
} from '@/features/earnings/lib/parse-author-earnings-search';
import { resolveAuthorEarningsPeriodId } from '@/features/earnings/lib/resolve-author-earnings-period-id';
import type { components } from '@/generated/author';

/**
 * GET /author/earnings/trend plus GET /author/earnings for the selected period.
 */
export function AuthorEarningsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AuthorEarningsSearch = parseAuthorEarningsSearch(searchParams);
  const trendQuery = useAuthorEarningsTrend({
    limit: AUTHOR_LIST_PAGE_SIZE,
    offset: listSearch.trendOffset,
  });
  const replaceSearch = (nextSearch: AuthorEarningsSearch): void => {
    setSearchParams(buildEarningsSearchParams(nextSearch), { replace: true });
  };
  if (trendQuery.isPending) {
    return <AuthorEarningsTableSkeleton />;
  }
  if (trendQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(trendQuery.error)}
        onRetry={() => {
          void trendQuery.refetch();
        }}
      />
    );
  }
  const trend: components['schemas']['GetAuthorEarningsTrendResponseDto'] = trendQuery.data;
  if (trend.points.length === 0) {
    return (
      <EmptyState
        title="No revenue periods yet"
        description="GET /author/earnings/trend returned an empty list."
      />
    );
  }
  const selectedPeriodId: number | undefined = resolveAuthorEarningsPeriodId({
    revenuePeriodId: listSearch.revenuePeriodId,
    points: trend.points,
  });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Earnings trend</CardTitle>
          <CardDescription>
            authorCents per period comes from GET /author/earnings/trend. This table is not a
            payout calculator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthorEarningsTrendTable
            points={trend.points}
            selectedPeriodId={selectedPeriodId}
            onSelectPeriod={(revenuePeriodId: number) => {
              replaceSearch({
                revenuePeriodId,
                offset: 0,
                trendOffset: listSearch.trendOffset,
              });
            }}
          />
          <ListPagination
            offset={listSearch.trendOffset}
            limit={AUTHOR_LIST_PAGE_SIZE}
            total={trend.total}
            onOffsetChange={(trendOffset: number) => {
              replaceSearch({
                revenuePeriodId: listSearch.revenuePeriodId,
                offset: listSearch.offset,
                trendOffset,
              });
            }}
          />
        </CardContent>
      </Card>
      <AuthorEarningsPeriodBody
        selectedPeriodId={selectedPeriodId}
        listSearch={listSearch}
        replaceSearch={replaceSearch}
      />
    </div>
  );
}

function AuthorEarningsPeriodBody({
  selectedPeriodId,
  listSearch,
  replaceSearch,
}: {
  readonly selectedPeriodId: number | undefined;
  readonly listSearch: AuthorEarningsSearch;
  readonly replaceSearch: (nextSearch: AuthorEarningsSearch) => void;
}): JSX.Element {
  const earningsQuery = useAuthorEarnings(
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
        description="GET /author/earnings requires revenuePeriodId."
      />
    );
  }
  if (earningsQuery.isPending) {
    return <AuthorEarningsTableSkeleton />;
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
  const earnings: components['schemas']['GetAuthorEarningsResponseDto'] = earningsQuery.data;
  return (
    <div className="space-y-4">
      <AuthorEarningsMetricsCard
        metrics={[
          { label: 'authorCents', value: formatAuthorCentsLabel(earnings.authorCents) },
          { label: 'Rows', value: String(earnings.total) },
        ]}
      />
      {earnings.bookRevenues.length === 0 ? (
        <EmptyState
          title="No calculated earnings yet"
          description="GET /author/earnings returned an empty list for this period."
        />
      ) : (
        <AuthorEarningsTable bookRevenues={earnings.bookRevenues} />
      )}
      <ListPagination
        offset={listSearch.offset}
        limit={AUTHOR_LIST_PAGE_SIZE}
        total={earnings.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({
            revenuePeriodId: selectedPeriodId,
            offset,
            trendOffset: listSearch.trendOffset,
          });
        }}
      />
    </div>
  );
}

function buildEarningsSearchParams(search: AuthorEarningsSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.revenuePeriodId !== undefined) {
    params.set('revenuePeriodId', String(search.revenuePeriodId));
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  if (search.trendOffset > 0) {
    params.set('trendOffset', String(search.trendOffset));
  }
  return params;
}
