import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AdminPeriodMetric = {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
};

type AdminPeriodMetricsCardProps = {
  readonly title: string;
  readonly description: string;
  readonly metrics: ReadonlyArray<AdminPeriodMetric>;
};

/**
 * Displays backend period totals. It does not recompute shares or weights.
 */
export function AdminPeriodMetricsCard({
  title,
  description,
  metrics,
}: AdminPeriodMetricsCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {metric.label}
              </dt>
              <dd className="text-sm">
                {metric.value}
                {metric.hint !== undefined ? (
                  <span className="ml-2 text-xs text-muted-foreground">{metric.hint}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
