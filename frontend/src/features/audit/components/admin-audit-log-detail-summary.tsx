import type { JSX } from 'react';
import { Link } from 'react-router';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAuditEnumLabel } from '@/features/audit/lib/format-audit-enum-label';
import { formatAuditMetadata } from '@/features/audit/lib/format-audit-metadata';
import { formatAuditReason } from '@/features/audit/lib/format-audit-reason';
import { getAdminAuditSubjectPath } from '@/features/audit/lib/get-admin-audit-subject-path';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminAuditLogDetailSummaryProps = {
  readonly auditLog: components['schemas']['AuditLogResponse'];
};

/**
 * Read-only audit fields from GET /admin/audit-logs/:id.
 */
export function AdminAuditLogDetailSummary({
  auditLog,
}: AdminAuditLogDetailSummaryProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit entry</CardTitle>
        <CardDescription>
          Append-only. Missing events are not invented. Category-weight PATCH is not required here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="When">{formatWireInstant(auditLog.createdAt)}</SummaryItem>
          <SummaryItem label="Audit id">{String(auditLog.id)}</SummaryItem>
          <SummaryItem label="Actor">
            <Link
              className="underline-offset-4 hover:underline"
              to={`/admin/users/${auditLog.actorUserId}`}
            >
              User #{auditLog.actorUserId}
            </Link>
          </SummaryItem>
          <SummaryItem label="Action">{formatAuditEnumLabel(auditLog.action)}</SummaryItem>
          <SummaryItem label="Subject type">
            {formatAuditEnumLabel(auditLog.subjectType)}
          </SummaryItem>
          <SummaryItem label="Subject">{renderSubject(auditLog)}</SummaryItem>
          <SummaryItem label="Reason">{formatAuditReason(auditLog.reason)}</SummaryItem>
        </dl>
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Metadata
          </p>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 text-xs">
            {formatAuditMetadata(auditLog.metadata)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function renderSubject(auditLog: components['schemas']['AuditLogResponse']): JSX.Element {
  const subjectPath: string | null = getAdminAuditSubjectPath(
    auditLog.subjectType,
    auditLog.subjectId,
  );
  const label = `${formatAuditEnumLabel(auditLog.subjectType)} #${String(auditLog.subjectId)}`;
  if (subjectPath === null) {
    return <span>{label}</span>;
  }
  return (
    <Link className="underline-offset-4 hover:underline" to={subjectPath}>
      {label}
    </Link>
  );
}

function SummaryItem({
  label,
  children,
}: {
  readonly label: string;
  readonly children: JSX.Element | string;
}): JSX.Element {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
