import type { JSX } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBookRejectionReason } from '@/features/books/lib/format-book-rejection-reason';
import type { components } from '@/generated/author';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AuthorBookRejectionHistoryTableProps = {
  readonly rejections: ReadonlyArray<components['schemas']['AuditLogResponse']>;
};

/**
 * Read-only book_rejected rows for one owned book. Missing reasons are labeled, not invented.
 */
export function AuthorBookRejectionHistoryTable({
  rejections,
}: AuthorBookRejectionHistoryTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rejections.map((rejection) => (
          <TableRow key={rejection.id}>
            <TableCell>{formatWireInstant(rejection.createdAt)}</TableCell>
            <TableCell>{`User #${rejection.actorUserId}`}</TableCell>
            <TableCell className="max-w-md whitespace-normal">
              {formatBookRejectionReason(rejection.reason)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
