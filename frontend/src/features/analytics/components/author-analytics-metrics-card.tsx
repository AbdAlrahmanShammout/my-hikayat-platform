import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthorAnalyticsMetric = {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
};

type AuthorAnalyticsMetricsCardProps = {
  readonly metrics: ReadonlyArray<AuthorAnalyticsMetric>;
};

/**
 * Displays GET /author/analytics totals. It does not recompute weighted engagement.
 */
export function AuthorAnalyticsMetricsCard({
  metrics,
}: AuthorAnalyticsMetricsCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement totals</CardTitle>
        <CardDescription>
          totalReadingMinutes and totalWeightedEngagement come from the API. Visual scene time is
          not paid.
        </CardDescription>
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
