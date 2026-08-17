import type { JSX } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSubscriptionEnumLabel } from '@/features/subscriptions/lib/format-subscription-enum-label';
import { formatSubscriptionPlanLabel } from '@/features/subscriptions/lib/format-subscription-plan-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminSubscriptionDetailSummaryProps = {
  readonly subscription: components['schemas']['SubscriptionResponse'];
};

/**
 * Read-only subscription fields from GET /admin/subscriptions/:id.
 */
export function AdminSubscriptionDetailSummary({
  subscription,
}: AdminSubscriptionDetailSummaryProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Period dates are displayed as returned by the API. Entitlement is not recomputed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Plan">{formatSubscriptionPlanLabel(subscription)}</SummaryItem>
          <SummaryItem label="Plan kind">
            {formatSubscriptionEnumLabel(subscription.plan?.kind)}
          </SummaryItem>
          <SummaryItem label="Status">
            <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
              {formatSubscriptionEnumLabel(subscription.status)}
            </Badge>
          </SummaryItem>
          <SummaryItem label="User">
            <Link
              className="underline-offset-4 hover:underline"
              to={`/admin/users/${subscription.userId}`}
            >
              User #{subscription.userId}
            </Link>
          </SummaryItem>
          <SummaryItem label="Started">{formatWireInstant(subscription.startedAt)}</SummaryItem>
          <SummaryItem label="Period start">
            {formatOptionalInstant(subscription.currentPeriodStart)}
          </SummaryItem>
          <SummaryItem label="Period end">
            {formatOptionalInstant(subscription.currentPeriodEnd)}
          </SummaryItem>
          <SummaryItem label="Canceled at">
            {formatOptionalInstant(subscription.canceledAt)}
          </SummaryItem>
          <SummaryItem label="Activated at">
            {formatOptionalInstant(subscription.activatedAt)}
          </SummaryItem>
          <SummaryItem label="Subscription id">{String(subscription.id)}</SummaryItem>
        </dl>
      </CardContent>
    </Card>
  );
}

function formatOptionalInstant(value: unknown): string {
  if (!hasWireInstant(value)) {
    return 'Not set';
  }
  return formatWireInstant(value);
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
