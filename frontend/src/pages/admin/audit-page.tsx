import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminAuditLogsPanel } from '@/features/audit/components/admin-audit-logs-panel';

/**
 * Admin audit log list. Read-only GET /admin/audit-logs.
 */
export function AdminAuditPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Audit log" description="Read-only history of admin actions." />
      <AdminAuditLogsPanel />
    </>
  );
}
