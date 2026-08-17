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
import { formatDurationMs } from '@/features/revenue/lib/format-duration-ms';
import { formatLayoutType } from '@/features/revenue/lib/format-layout-type';
import type { components } from '@/generated/admin';

type AdminPeriodAnalyticsTableProps = {
  readonly revenuePeriodId: number;
  readonly bookEngagements: ReadonlyArray<components['schemas']['BookEngagementResponse']>;
};

/**
 * Weighted book engagement. Visual scene time is shown and is not paid.
 */
export function AdminPeriodAnalyticsTable({
  revenuePeriodId,
  bookEngagements,
}: AdminPeriodAnalyticsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>layoutType</TableHead>
          <TableHead>activeReadingMs</TableHead>
          <TableHead>activeSpreadMs</TableHead>
          <TableHead>visualSceneTimeMs</TableHead>
          <TableHead>categoryWeight</TableHead>
          <TableHead>weightedEngagement</TableHead>
          <TableHead className="text-right">Heatmap</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookEngagements.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/books/${row.bookId}`}
              >
                Book #{row.bookId}
              </Link>
            </TableCell>
            <TableCell>{formatLayoutType(row.layoutType)}</TableCell>
            <TableCell>{formatDurationMs(row.activeReadingMs)}</TableCell>
            <TableCell>{formatDurationMs(row.activeSpreadMs)}</TableCell>
            <TableCell>
              <span>{formatDurationMs(row.visualSceneTimeMs)}</span>
              <span className="ml-2 text-xs text-muted-foreground">Not paid</span>
            </TableCell>
            <TableCell>{String(row.categoryWeight)}</TableCell>
            <TableCell>{String(row.weightedEngagement)}</TableCell>
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
