import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminRevenuePeriodsPanel } from '@/features/revenue/components/admin-revenue-periods-panel';

/**
 * Admin revenue-period list. Create, open the current UTC month, then edit pool on detail.
 */
export function AdminRevenuePage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Revenue periods"
        description="Pool amount is admin-set cents. Platform cut belongs to the period."
      />
      <AdminRevenuePeriodsPanel />
    </>
  );
}
