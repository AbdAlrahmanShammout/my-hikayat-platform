import type { JSX } from 'react';
import { Link } from 'react-router';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAuthorCentsLabel } from '@/features/earnings/lib/format-author-cents-label';
import type { components } from '@/generated/author';

type AuthorEarningsTableProps = {
  readonly bookRevenues: ReadonlyArray<components['schemas']['BookRevenueResponse']>;
};

/**
 * Per-book shares from GET /author/earnings. Values are displayed as returned.
 */
export function AuthorEarningsTable({ bookRevenues }: AuthorEarningsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>weightedEngagement</TableHead>
          <TableHead>poolShareCents</TableHead>
          <TableHead>platformCutCents</TableHead>
          <TableHead>authorCents</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookRevenues.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/author/books/${row.bookId}`}
              >
                Book #{row.bookId}
              </Link>
            </TableCell>
            <TableCell>{String(row.weightedEngagement)}</TableCell>
            <TableCell>{formatAuthorCentsLabel(row.poolShareCents)}</TableCell>
            <TableCell>{formatAuthorCentsLabel(row.platformCutCents)}</TableCell>
            <TableCell>{formatAuthorCentsLabel(row.authorCents)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
