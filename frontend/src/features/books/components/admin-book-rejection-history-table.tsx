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
import { formatBookRejectionReason } from '@/features/books/lib/format-book-rejection-reason';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminBookRejectionHistoryTableProps = {
  readonly rejections: ReadonlyArray<components['schemas']['AuditLogResponse']>;
};

/**
 * Read-only book_rejected rows for one book. Missing reasons are labeled, not invented.
 */
export function AdminBookRejectionHistoryTable({
  rejections,
}: AdminBookRejectionHistoryTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Audit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rejections.map((rejection) => (
          <TableRow key={rejection.id}>
            <TableCell>{formatWireInstant(rejection.createdAt)}</TableCell>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/users/${rejection.actorUserId}`}
              >
                User #{rejection.actorUserId}
              </Link>
            </TableCell>
            <TableCell className="max-w-md whitespace-normal">
              {formatBookRejectionReason(rejection.reason)}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/audit/${rejection.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
