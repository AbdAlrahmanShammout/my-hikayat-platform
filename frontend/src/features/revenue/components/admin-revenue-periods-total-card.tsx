import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { ADMIN_COUNT_LIST_LIMIT } from '@/config/admin-count-list-limit';
import { useAdminRevenuePeriodsList } from '@/features/revenue/hooks/use-admin-revenue-periods-list';

/**
 * Home KPI for GET /admin/revenue-periods `total`.
 */
export function AdminRevenuePeriodsTotalCard(): JSX.Element {
  const query = useAdminRevenuePeriodsList({ limit: ADMIN_COUNT_LIST_LIMIT });
  return (
    <KpiCard
      title="Revenue periods"
      description="Open and closed periods. Pool amounts are not summed here."
      emptyLabel="No revenue periods yet."
      total={query.data?.total}
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      onRetry={() => {
        void query.refetch();
      }}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/revenue">Open revenue</Link>
        </Button>
      }
    />
  );
}
