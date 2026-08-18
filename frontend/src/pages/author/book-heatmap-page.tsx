import type { JSX } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AuthorBookHeatmap } from '@/features/analytics/components/author-book-heatmap';
import { useAuthorBookHeatmap } from '@/features/analytics/hooks/use-author-book-heatmap';
import { formatLayoutType } from '@/features/analytics/lib/format-layout-type';
import { parseAuthorBookHeatmapSearch } from '@/features/analytics/lib/parse-author-book-heatmap-search';
import type { components } from '@/generated/author';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Layout-aware author heatmap for one owned book in a revenue period.
 */
export function AuthorBookHeatmapPage(): JSX.Element {
  const { bookId: bookIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const bookId: number | null = parsePositiveInt(bookIdParam);
  const revenuePeriodId: number | undefined =
    parseAuthorBookHeatmapSearch(searchParams).revenuePeriodId;
  if (bookId === null || revenuePeriodId === undefined) {
    return (
      <>
        <PageHeader title="Heatmap" description="Layout-aware engagement cells for this period." />
        <ErrorState
          title="Invalid heatmap route"
          message="The book id and revenuePeriodId must be positive integers."
        />
      </>
    );
  }
  return <AuthorBookHeatmapContent bookId={bookId} revenuePeriodId={revenuePeriodId} />;
}

function AuthorBookHeatmapContent({
  bookId,
  revenuePeriodId,
}: {
  readonly bookId: number;
  readonly revenuePeriodId: number;
}): JSX.Element {
  const heatmapQuery = useAuthorBookHeatmap(bookId, revenuePeriodId);
  const backAction = backToAnalyticsAction(revenuePeriodId);
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
  const heatmap: components['schemas']['GetAuthorBookHeatmapResponseDto'] = heatmapQuery.data;
  return (
    <>
      <PageHeader
        title={`Book #${String(heatmap.bookId)} heatmap`}
        description={`layoutType ${formatLayoutType(heatmap.layoutType)}. Visual scene time is not paid.`}
        actions={backAction}
      />
      <AuthorBookHeatmap heatmap={heatmap} />
    </>
  );
}

function backToAnalyticsAction(revenuePeriodId: number): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to={`/author/analytics?revenuePeriodId=${String(revenuePeriodId)}`}>
        Back to analytics
      </Link>
    </Button>
  );
}

function getHeatmapLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This book or revenue period was not found. You may not own the book.';
  }
  return getUserFacingErrorMessage(error);
}
