import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminSubscriptionsPanel } from '@/features/subscriptions/components/admin-subscriptions-panel';

/**
 * Admin subscriptions list. Filters and paging are query parameters on GET /admin/subscriptions.
 */
export function AdminSubscriptionsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Cancel without a refund. Access lasts until currentPeriodEnd."
      />
      <AdminSubscriptionsPanel />
    </>
  );
}
