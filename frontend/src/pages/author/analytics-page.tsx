import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AUTHOR_PERIOD_LOOKUP_LIMIT } from '@/config/author-period-lookup-limit';
import { AuthorAnalyticsPanel } from '@/features/analytics/components/author-analytics-panel';
import { toAuthorAnalyticsPeriodOptions } from '@/features/analytics/lib/to-author-analytics-period-options';
import { useAuthorEarningsTrend } from '@/features/earnings/hooks/use-author-earnings-trend';

/**
 * Author analytics. Totals come from GET /author/analytics. Period ids come from earnings/trend.
 */
export function AuthorAnalyticsPage(): JSX.Element {
  const periodsQuery = useAuthorEarningsTrend({ limit: AUTHOR_PERIOD_LOOKUP_LIMIT });
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Engagement totals and per-book rows are displayed from the API. Weighted engagement is not recomputed here."
      />
      <AuthorAnalyticsPanel
        periods={toAuthorAnalyticsPeriodOptions(periodsQuery.data?.points ?? [])}
        isPeriodsPending={periodsQuery.isPending}
        periodsError={periodsQuery.error}
        onRetryPeriods={() => {
          void periodsQuery.refetch();
        }}
      />
    </>
  );
}
