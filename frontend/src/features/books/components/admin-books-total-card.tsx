import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { ADMIN_COUNT_LIST_LIMIT } from '@/config/admin-count-list-limit';
import { useAdminBooksList } from '@/features/books/hooks/use-admin-books-list';

/**
 * Home KPI for GET /admin/books `total`.
 */
export function AdminBooksTotalCard(): JSX.Element {
  const query = useAdminBooksList({ limit: ADMIN_COUNT_LIST_LIMIT });
  return (
    <KpiCard
      title="Books"
      description="Every catalog record, all publishing statuses."
      emptyLabel="No books yet."
      total={query.data?.total}
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      onRetry={() => {
        void query.refetch();
      }}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/books">Open books</Link>
        </Button>
      }
    />
  );
}
