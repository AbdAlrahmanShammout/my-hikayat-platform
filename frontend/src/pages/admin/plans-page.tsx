import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminPlansPanel } from '@/features/plans/components/admin-plans-panel';

/**
 * Admin subscription catalog plans. Create and edit paid Stripe plans.
 */
export function AdminPlansPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Plans"
        description="Register Stripe recurring prices as paid plans readers can subscribe to."
      />
      <AdminPlansPanel />
    </>
  );
}
