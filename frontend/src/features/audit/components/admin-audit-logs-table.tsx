import type { JSX } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAuditEnumLabel } from '@/features/audit/lib/format-audit-enum-label';
import { getAdminAuditSubjectPath } from '@/features/audit/lib/get-admin-audit-subject-path';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminAuditLogsTableProps = {
  readonly auditLogs: ReadonlyArray<components['schemas']['AuditLogResponse']>;
};

/**
 * Read-only audit table. Missing events are not invented.
 */
export function AdminAuditLogsTable({ auditLogs }: AdminAuditLogsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((auditLog) => (
          <TableRow key={auditLog.id}>
            <TableCell>{formatWireInstant(auditLog.createdAt)}</TableCell>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/users/${auditLog.actorUserId}`}
              >
                User #{auditLog.actorUserId}
              </Link>
            </TableCell>
            <TableCell>{formatAuditEnumLabel(auditLog.action)}</TableCell>
            <TableCell>{renderSubjectCell(auditLog)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/audit/${auditLog.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function renderSubjectCell(auditLog: components['schemas']['AuditLogResponse']): JSX.Element {
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
