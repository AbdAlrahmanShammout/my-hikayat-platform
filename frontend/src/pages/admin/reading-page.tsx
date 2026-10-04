import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminReadingDrilldownPanel } from '@/features/dashboard/components/admin-reading-drilldown-panel';

/**
 * Reading minutes drill-down. This screen does not use revenue data.
 */
export function AdminReadingPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Reading minutes"
        description="Paid reading and spread time from book engagement. Visual scene time is excluded."
      />
      <AdminReadingDrilldownPanel />
    </>
  );
}
