import type { JSX } from 'react';
import { Link } from 'react-router';

import { ProgressBar } from '@/components/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatReadingAccessState } from '@/features/users/lib/format-reading-access-state';
import { formatRemainingTimeLabel } from '@/features/users/lib/format-remaining-time-label';
import { formatSubscriptionStatusLabel } from '@/features/users/lib/format-subscription-status-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminUserSubscriptionCardProps = {
  readonly subscription: components['schemas']['SubscriptionResponse'] | null;
  readonly subscriptionPeriod: components['schemas']['AdminUserSubscriptionPeriodResponse'];
};

/**
 * Displays canonical subscription fields from GET /admin/users/:id.
 */
export function AdminUserSubscriptionCard({
  subscription,
  subscriptionPeriod,
}: AdminUserSubscriptionCardProps): JSX.Element {
  if (subscription === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>No subscription record is stored for this user.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const remainingLabel: string | null = formatRemainingTimeLabel(subscriptionPeriod.remainingMs);
  const planName: string = formatPlanName(subscription);
  const hasBoundedPeriod: boolean = subscriptionPeriod.elapsedPercent !== null;
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Plan, status, and remaining time come from the API. Entitlement is not recomputed here.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/admin/subscriptions/${subscription.id}`}>View subscription</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Plan">{planName}</SummaryItem>
          <SummaryItem label="Access">
            <Badge variant={subscription.readingAccessState === 'paid' ? 'default' : 'secondary'}>
              {formatReadingAccessState(subscription.readingAccessState)}
            </Badge>
          </SummaryItem>
          <SummaryItem label="Status">
            <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
              {formatSubscriptionStatusLabel(subscription.status)}
            </Badge>
          </SummaryItem>
          <SummaryItem label="Started">{formatWireInstant(subscription.startedAt)}</SummaryItem>
        </dl>
        {hasBoundedPeriod ? (
          <BoundedPeriodBlock
            planName={planName}
            remainingLabel={remainingLabel}
            subscriptionPeriod={subscriptionPeriod}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No expiration</p>
        )}
      </CardContent>
    </Card>
  );
}

function BoundedPeriodBlock({
  planName,
  remainingLabel,
  subscriptionPeriod,
}: {
  readonly planName: string;
  readonly remainingLabel: string | null;
  readonly subscriptionPeriod: components['schemas']['AdminUserSubscriptionPeriodResponse'];
}): JSX.Element {
  const elapsedPercent: number = subscriptionPeriod.elapsedPercent ?? 0;
  return (
    <div className="space-y-2">
      <ProgressBar value={elapsedPercent} label={`${planName} period elapsed`} />
      {remainingLabel !== null ? <p className="text-sm">{remainingLabel}</p> : null}
      {hasWireInstant(subscriptionPeriod.periodEndsAt) ? (
        <p className="text-sm text-muted-foreground">
          {`Ends ${formatWireInstant(subscriptionPeriod.periodEndsAt)}`}
        </p>
      ) : null}
    </div>
  );
}

function formatPlanName(subscription: components['schemas']['SubscriptionResponse']): string {
  if (subscription.plan?.name !== undefined && subscription.plan.name !== '') {
    return subscription.plan.name;
  }
  return `Plan #${String(subscription.planId)}`;
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
