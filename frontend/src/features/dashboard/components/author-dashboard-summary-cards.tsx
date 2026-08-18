import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { useAuthorDashboardSummary } from '@/features/dashboard/hooks/use-author-dashboard-summary';
import { formatCents } from '@/lib/format-cents';

/**
 * Author Home KPI row from GET /author/dashboard/summary.
 */
export function AuthorDashboardSummaryCards(): JSX.Element {
  const query = useAuthorDashboardSummary();
  const onRetry = (): void => {
    void query.refetch();
  };
  const authorCents: number | undefined = query.data?.authorCents;
  return (
    <>
      <KpiCard
        title="Books"
        description="Every book you own, all publishing statuses."
        emptyLabel="No books yet."
        total={query.data?.totalBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/author/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Published books"
        description="Your catalog-visible books."
        emptyLabel="No published books yet."
        total={query.data?.publishedBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/author/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Pending review"
        description="Your books currently in review."
        emptyLabel="No books in review."
        total={query.data?.pendingReviewBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/author/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Reading minutes"
        description="Lifetime active reading plus spread time on your books, in minutes."
        emptyLabel="No reading minutes yet."
        total={query.data?.totalReadingMinutes}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/author/analytics">Open analytics</Link>
          </Button>
        }
      />
      <KpiCard
        title="Earnings"
        description="Stored author earnings across every calculated period."
        emptyLabel="No earnings yet."
        total={authorCents}
        formattedValue={authorCents === undefined ? undefined : formatCents(authorCents)}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/author/earnings">Open earnings</Link>
          </Button>
        }
      />
    </>
  );
}
