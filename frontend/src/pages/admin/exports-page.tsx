import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminExportsPanel } from '@/features/exports/components/admin-exports-panel';

/**
 * CSV export jobs. Generation stays on the server.
 */
export function AdminExportsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Exports"
        description="Estimate a CSV, then create it. Files are ready for 24 hours and are limited to 10,000 rows."
      />
      <AdminExportsPanel />
    </>
  );
}
