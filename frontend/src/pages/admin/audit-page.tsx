import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Audit log placeholder until STEP 10.
 */
export function AdminAuditPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Audit log" description="Read-only history of admin actions." />
      <EmptyState
        title="Audit log is not available yet"
        description="STEP 10 will list GET /admin/audit-logs. Category-weight PATCH is not an audit event."
      />
    </>
  );
}
