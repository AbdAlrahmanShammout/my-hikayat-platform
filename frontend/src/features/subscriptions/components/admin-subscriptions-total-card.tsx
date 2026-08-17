import type { JSX } from 'react';
import { Link } from 'react-router';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { ADMIN_COUNT_LIST_LIMIT } from '@/config/admin-count-list-limit';
import { useAdminSubscriptionsList } from '@/features/subscriptions/hooks/use-admin-subscriptions-list';

/**
 * Home KPI for GET /admin/subscriptions `total`.
 */
export function AdminSubscriptionsTotalCard(): JSX.Element {
  const query = useAdminSubscriptionsList({ limit: ADMIN_COUNT_LIST_LIMIT });
  return (
    <KpiCard
      title="Subscriptions"
      description="All subscription rows. Entitlement is not computed here."
      emptyLabel="No subscriptions yet."
      total={query.data?.total}
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      onRetry={() => {
        void query.refetch();
      }}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/subscriptions">Open subscriptions</Link>
        </Button>
      }
    />
  );
}
