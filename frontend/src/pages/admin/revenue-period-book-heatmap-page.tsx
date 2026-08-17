import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AdminPeriodBookHeatmap } from '@/features/revenue/components/admin-period-book-heatmap';
import { useAdminPeriodBookHeatmap } from '@/features/revenue/hooks/use-admin-period-book-heatmap';
import { formatLayoutType } from '@/features/revenue/lib/format-layout-type';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Layout-aware admin heatmap for one book in a revenue period.
 */
export function AdminRevenuePeriodBookHeatmapPage(): JSX.Element {
  const { revenuePeriodId: revenuePeriodIdParam, bookId: bookIdParam } = useParams();
  const revenuePeriodId: number | null = parsePositiveInt(revenuePeriodIdParam);
  const bookId: number | null = parsePositiveInt(bookIdParam);
  if (revenuePeriodId === null || bookId === null) {
    return (
      <>
        <PageHeader title="Heatmap" description="Layout-aware engagement cells for this period." />
        <ErrorState
          title="Invalid heatmap route"
          message="The revenue period id and book id in the URL must be positive integers."
        />
      </>
    );
  }
  return (
    <AdminRevenuePeriodBookHeatmapContent revenuePeriodId={revenuePeriodId} bookId={bookId} />
  );
}

function AdminRevenuePeriodBookHeatmapContent({
  revenuePeriodId,
  bookId,
}: {
  readonly revenuePeriodId: number;
  readonly bookId: number;
}): JSX.Element {
  const heatmapQuery = useAdminPeriodBookHeatmap(revenuePeriodId, bookId);
  const backAction = backToPeriodAction(revenuePeriodId);
  if (heatmapQuery.isPending) {
    return (
      <>
        <PageHeader
          title={`Book #${String(bookId)} heatmap`}
          description="Layout-aware engagement cells for this period."
          actions={backAction}
        />
        <PageSkeleton />
      </>
    );
  }
  if (heatmapQuery.isError) {
    return (
      <>
        <PageHeader
          title={`Book #${String(bookId)} heatmap`}
          description="Layout-aware engagement cells for this period."
          actions={backAction}
        />
        <ErrorState
          message={getHeatmapLoadMessage(heatmapQuery.error)}
          onRetry={() => {
            void heatmapQuery.refetch();
          }}
        />
      </>
    );
  }
  const heatmap = heatmapQuery.data;
  return (
    <>
      <PageHeader
        title={`Book #${String(heatmap.bookId)} heatmap`}
        description={`layoutType ${formatLayoutType(heatmap.layoutType)}. Visual scene time is not paid.`}
        actions={backAction}
      />
      <AdminPeriodBookHeatmap heatmap={heatmap} />
    </>
  );
}

function backToPeriodAction(revenuePeriodId: number): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to={`/admin/revenue/${revenuePeriodId}`}>Back to period</Link>
    </Button>
  );
}

function getHeatmapLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This book or revenue period was not found.';
  }
  return getUserFacingErrorMessage(error);
}
