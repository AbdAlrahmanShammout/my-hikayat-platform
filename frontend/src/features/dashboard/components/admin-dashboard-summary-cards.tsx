import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { useAdminDashboardSummary } from '@/features/dashboard/hooks/use-admin-dashboard-summary';

/**
 * Admin Home KPI row from GET /admin/dashboard/summary.
 */
export function AdminDashboardSummaryCards(): JSX.Element {
  const query = useAdminDashboardSummary();
  const onRetry = (): void => {
    void query.refetch();
  };
  return (
    <>
      <KpiCard
        title="Users"
        description="Every non-deleted account."
        emptyLabel="No users yet."
        total={query.data?.totalUsers}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/users">Open users</Link>
          </Button>
        }
      />
      <KpiCard
        title="Publishers"
        description="Accounts with publisher capability, including admin publishers."
        emptyLabel="No publishers yet."
        total={query.data?.totalPublishers}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/users">Open users</Link>
          </Button>
        }
      />
      <KpiCard
        title="Books"
        description="Every catalog record, all publishing statuses."
        emptyLabel="No books yet."
        total={query.data?.totalBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Published books"
        description="Catalog-visible books only."
        emptyLabel="No published books yet."
        total={query.data?.publishedBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Pending review"
        description="Books currently in review."
        emptyLabel="No books in review."
        total={query.data?.pendingReviewBooks}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/books">Open books</Link>
          </Button>
        }
      />
      <KpiCard
        title="Reading minutes"
        description="Lifetime active reading plus spread time, in minutes."
        emptyLabel="No reading minutes yet."
        total={query.data?.totalReadingMinutes}
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={onRetry}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/revenue-periods">Open revenue periods</Link>
          </Button>
        }
      />
    </>
  );
}
