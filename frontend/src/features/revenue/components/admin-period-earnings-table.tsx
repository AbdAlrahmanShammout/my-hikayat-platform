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
import { formatPoolAmountLabel } from '@/features/revenue/lib/format-pool-amount-label';
import type { components } from '@/generated/admin';

type AdminPeriodEarningsTableProps = {
  readonly revenuePeriodId: number;
  readonly bookRevenues: ReadonlyArray<components['schemas']['BookRevenueResponse']>;
};

/**
 * Calculated book earnings. Values are displayed as returned by the API.
 */
export function AdminPeriodEarningsTable({
  revenuePeriodId,
  bookRevenues,
}: AdminPeriodEarningsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>weightedEngagement</TableHead>
          <TableHead>poolShareCents</TableHead>
          <TableHead>platformCutCents</TableHead>
          <TableHead>authorCents</TableHead>
          <TableHead className="text-right">Heatmap</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookRevenues.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/books/${row.bookId}`}
              >
                Book #{row.bookId}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/users/${row.ownerId}`}
              >
                User #{row.ownerId}
              </Link>
            </TableCell>
            <TableCell>{String(row.weightedEngagement)}</TableCell>
            <TableCell>{formatPoolAmountLabel(row.poolShareCents)}</TableCell>
            <TableCell>{formatPoolAmountLabel(row.platformCutCents)}</TableCell>
            <TableCell>{formatPoolAmountLabel(row.authorCents)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/revenue/${revenuePeriodId}/books/${row.bookId}/heatmap`}>
                  Heatmap
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
