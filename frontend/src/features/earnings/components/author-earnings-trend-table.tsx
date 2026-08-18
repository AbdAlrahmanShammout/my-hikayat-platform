import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAuthorCentsLabel } from '@/features/earnings/lib/format-author-cents-label';
import { formatRevenuePeriodStatus } from '@/features/earnings/lib/format-revenue-period-status';
import type { components } from '@/generated/author';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AuthorEarningsTrendTableProps = {
  readonly points: ReadonlyArray<components['schemas']['AuthorEarningsTrendPointResponse']>;
  readonly selectedPeriodId: number | undefined;
  readonly onSelectPeriod: (revenuePeriodId: number) => void;
};

/**
 * GET /author/earnings/trend. authorCents is displayed from the API, not summed here.
 */
export function AuthorEarningsTrendTable({
  points,
  selectedPeriodId,
  onSelectPeriod,
}: AuthorEarningsTrendTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Starts</TableHead>
          <TableHead>Ends</TableHead>
          <TableHead>status</TableHead>
          <TableHead>authorCents</TableHead>
          <TableHead className="text-right">Period books</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {points.map((point) => (
          <TableRow
            key={point.revenuePeriodId}
            className={point.revenuePeriodId === selectedPeriodId ? 'bg-muted/50' : undefined}
          >
            <TableCell>{formatWireInstant(point.startsAt)}</TableCell>
            <TableCell>{formatWireInstant(point.endsAt)}</TableCell>
            <TableCell>{formatRevenuePeriodStatus(point.status)}</TableCell>
            <TableCell>{formatAuthorCentsLabel(point.authorCents)}</TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant={point.revenuePeriodId === selectedPeriodId ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  onSelectPeriod(point.revenuePeriodId);
                }}
              >
                {point.revenuePeriodId === selectedPeriodId ? 'Selected' : 'View books'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
