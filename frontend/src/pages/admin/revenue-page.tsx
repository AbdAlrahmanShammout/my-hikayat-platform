import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminEnsureCurrentRevenuePeriod } from '@/features/revenue/components/admin-ensure-current-revenue-period';
import { AdminRevenuePeriodCreateDialog } from '@/features/revenue/components/admin-revenue-period-create-dialog';
import { AdminRevenuePeriodsPanel } from '@/features/revenue/components/admin-revenue-periods-panel';

/**
 * Admin revenue-period list. Create a period or open the current UTC month.
 */
export function AdminRevenuePage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Revenue periods"
        description="Net pool is written when a period is calculated. Publishers receive 40 percent of that net."
        actions={
          <>
            <AdminEnsureCurrentRevenuePeriod />
            <AdminRevenuePeriodCreateDialog />
          </>
        }
      />
      <AdminRevenuePeriodsPanel />
    </>
  );
}
