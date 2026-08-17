import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AdminAuditLogDetailSummary } from '@/features/audit/components/admin-audit-log-detail-summary';
import { useAdminAuditLog } from '@/features/audit/hooks/use-admin-audit-log';
import { formatAuditEnumLabel } from '@/features/audit/lib/format-audit-enum-label';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Admin audit detail: actor, action, subject, reason, and metadata.
 */
export function AdminAuditDetailPage(): JSX.Element {
  const { auditLogId: auditLogIdParam } = useParams();
  const auditLogId: number | null = parsePositiveInt(auditLogIdParam);
  if (auditLogId === null) {
    return (
      <>
        <PageHeader title="Audit entry" description="Read-only history of admin actions." />
        <ErrorState
          title="Invalid audit log id"
          message="The audit log id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminAuditDetailContent auditLogId={auditLogId} />;
}

function AdminAuditDetailContent({
  auditLogId,
}: {
  readonly auditLogId: number;
}): JSX.Element {
  const auditLogQuery = useAdminAuditLog(auditLogId);
  if (auditLogQuery.isPending) {
    return (
      <>
        <PageHeader title="Audit entry" description="Read-only history of admin actions." />
        <PageSkeleton />
      </>
    );
  }
  if (auditLogQuery.isError) {
    return (
      <>
        <PageHeader
          title="Audit entry"
          description="Read-only history of admin actions."
          actions={backToAuditAction()}
        />
        <ErrorState
          message={getAuditLogLoadMessage(auditLogQuery.error)}
          onRetry={() => {
            void auditLogQuery.refetch();
          }}
        />
      </>
    );
  }
  const auditLog = auditLogQuery.data;
  return (
    <>
      <PageHeader
        title={formatAuditEnumLabel(auditLog.action)}
        description="Read-only. Missing events are not invented."
        actions={backToAuditAction()}
      />
      <AdminAuditLogDetailSummary auditLog={auditLog} />
    </>
  );
}

function backToAuditAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/audit">Back to audit log</Link>
    </Button>
  );
}

function getAuditLogLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This audit entry was not found.';
  }
  return getUserFacingErrorMessage(error);
}
