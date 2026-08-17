import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { ADMIN_COUNT_LIST_LIMIT } from '@/config/admin-count-list-limit';
import { useAdminUsersList } from '@/features/users/hooks/use-admin-users-list';

/**
 * Home KPI for GET /admin/users `total`.
 */
export function AdminUsersTotalCard(): JSX.Element {
  const query = useAdminUsersList({ limit: ADMIN_COUNT_LIST_LIMIT });
  return (
    <KpiCard
      title="Users"
      description="Accounts returned by the admin user list."
      emptyLabel="No users yet."
      total={query.data?.total}
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      onRetry={() => {
        void query.refetch();
      }}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users">Open users</Link>
        </Button>
      }
    />
  );
}
