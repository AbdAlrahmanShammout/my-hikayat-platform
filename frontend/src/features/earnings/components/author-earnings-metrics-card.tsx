import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthorEarningsMetric = {
  readonly label: string;
  readonly value: string;
};

type AuthorEarningsMetricsCardProps = {
  readonly metrics: ReadonlyArray<AuthorEarningsMetric>;
};

/**
 * Displays GET /author/earnings totals. It does not recalculate payouts.
 */
export function AuthorEarningsMetricsCard({
  metrics,
}: AuthorEarningsMetricsCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Period totals</CardTitle>
        <CardDescription>
          authorCents comes from GET /author/earnings. Pool splits are not recomputed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {metric.label}
              </dt>
              <dd className="text-sm">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
