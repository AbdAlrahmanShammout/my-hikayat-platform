import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AdminRevenuePeriodActions } from '@/features/revenue/components/admin-revenue-period-actions';
import { AdminRevenuePeriodDetailSummary } from '@/features/revenue/components/admin-revenue-period-detail-summary';
import { AdminRevenuePeriodPoolForm } from '@/features/revenue/components/admin-revenue-period-pool-form';
import { AdminRevenuePeriodResults } from '@/features/revenue/components/admin-revenue-period-results';
import { AdminRevenuePeriodShareActions } from '@/features/revenue/components/admin-revenue-period-share-actions';
import { useAdminRevenuePeriod } from '@/features/revenue/hooks/use-admin-revenue-period';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Admin revenue-period detail: pool, close, calculate, earnings, and analytics.
 */
export function AdminRevenueDetailPage(): JSX.Element {
  const { revenuePeriodId: revenuePeriodIdParam } = useParams();
  const revenuePeriodId: number | null = parsePositiveInt(revenuePeriodIdParam);
  if (revenuePeriodId === null) {
    return (
      <>
        <PageHeader
          title="Revenue period"
          description="Pool amount is admin-set cents. Platform cut belongs to the period."
        />
        <ErrorState
          title="Invalid revenue period id"
          message="The revenue period id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminRevenueDetailContent revenuePeriodId={revenuePeriodId} />;
}

function AdminRevenueDetailContent({
  revenuePeriodId,
}: {
  readonly revenuePeriodId: number;
}): JSX.Element {
  const periodQuery = useAdminRevenuePeriod(revenuePeriodId);
  if (periodQuery.isPending) {
    return (
      <>
        <PageHeader
          title="Revenue period"
          description="Pool amount is admin-set cents. Platform cut belongs to the period."
        />
        <PageSkeleton />
      </>
    );
  }
  if (periodQuery.isError) {
    return (
      <>
        <PageHeader
          title="Revenue period"
          description="Pool amount is admin-set cents. Platform cut belongs to the period."
          actions={backToRevenueAction()}
        />
        <ErrorState
          message={getRevenuePeriodLoadMessage(periodQuery.error)}
          onRetry={() => {
            void periodQuery.refetch();
          }}
        />
      </>
    );
  }
  const period = periodQuery.data;
  return (
    <>
      <PageHeader
        title={`${formatWireInstant(period.startsAt)} – ${formatWireInstant(period.endsAt)}`}
        description="Pool amount is admin-set cents. Calculate writes shares from backend totals."
        actions={backToRevenueAction()}
      />
      <div className="space-y-6">
        <AdminRevenuePeriodShareActions period={period} />
        <AdminRevenuePeriodActions period={period} />
        <AdminRevenuePeriodPoolForm
          key={`${period.id}-${period.updatedAt}-${period.status}`}
          period={period}
        />
        <AdminRevenuePeriodDetailSummary period={period} />
        <AdminRevenuePeriodResults revenuePeriodId={period.id} />
      </div>
    </>
  );
}

function backToRevenueAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/revenue">Back to revenue periods</Link>
    </Button>
  );
}

function getRevenuePeriodLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This revenue period was not found.';
  }
  return getUserFacingErrorMessage(error);
}
