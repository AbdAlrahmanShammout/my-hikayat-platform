import type { JSX } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
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
import { formatRevenuePeriodStatus } from '@/features/revenue/lib/format-revenue-period-status';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminRevenuePeriodsTableProps = {
  readonly revenuePeriods: ReadonlyArray<components['schemas']['RevenuePeriodResponse']>;
};

/**
 * Admin revenue-period table. Pool is displayed from integer cents.
 */
export function AdminRevenuePeriodsTable({
  revenuePeriods,
}: AdminRevenuePeriodsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>startsAt</TableHead>
          <TableHead>endsAt</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>platformCutPercent</TableHead>
          <TableHead>Pool</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revenuePeriods.map((period) => (
          <TableRow key={period.id}>
            <TableCell>{formatWireInstant(period.startsAt)}</TableCell>
            <TableCell>{formatWireInstant(period.endsAt)}</TableCell>
            <TableCell>
              <Badge variant={period.status === 'open' ? 'default' : 'outline'}>
                {formatRevenuePeriodStatus(period.status)}
              </Badge>
            </TableCell>
            <TableCell>{String(period.platformCutPercent)}</TableCell>
            <TableCell>{formatPoolAmountLabel(period.poolAmountCents)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/revenue/${period.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
