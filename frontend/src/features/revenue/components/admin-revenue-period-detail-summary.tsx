import type { JSX } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPoolAmountLabel } from '@/features/revenue/lib/format-pool-amount-label';
import { formatRevenuePeriodStatus } from '@/features/revenue/lib/format-revenue-period-status';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminRevenuePeriodDetailSummaryProps = {
  readonly period: components['schemas']['RevenuePeriodResponse'];
};

/**
 * Read-only revenue-period fields from GET /admin/revenue-periods/:id.
 */
export function AdminRevenuePeriodDetailSummary({
  period,
}: AdminRevenuePeriodDetailSummaryProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Period</CardTitle>
        <CardDescription>
          Dates are displayed as returned by the API. Pool is admin-set cents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Status">
            <Badge variant={period.status === 'open' ? 'default' : 'outline'}>
              {formatRevenuePeriodStatus(period.status)}
            </Badge>
          </SummaryItem>
          <SummaryItem label="startsAt">{formatWireInstant(period.startsAt)}</SummaryItem>
          <SummaryItem label="endsAt">{formatWireInstant(period.endsAt)}</SummaryItem>
          <SummaryItem label="platformCutPercent">{String(period.platformCutPercent)}</SummaryItem>
          <SummaryItem label="Pool">{formatPoolAmountLabel(period.poolAmountCents)}</SummaryItem>
          <SummaryItem label="Period id">{String(period.id)}</SummaryItem>
        </dl>
      </CardContent>
    </Card>
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
