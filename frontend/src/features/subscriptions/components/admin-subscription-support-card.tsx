import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { CopyTextButton } from '@/components/copy-text-button';
import { ErrorState } from '@/components/error-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPlanAmountLabel } from '@/features/plans/lib/format-plan-amount-label';
import { useAdminSubscriptionSupportContext } from '@/features/subscriptions/hooks/use-admin-subscription-support-context';
import { formatReadingAccessState } from '@/features/users/lib/format-reading-access-state';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

const ACCESS_EXPLANATIONS: Record<string, string> = {
  paid_until_period_end: 'Paid until the current period ends',
  trial_until: 'Trial until the trial end',
  free: 'Free',
};

const REFUND_LABELS: Record<string, string> = {
  eligible: 'Eligible',
  REFUND_WINDOW_EXPIRED: 'Refund window expired',
  REFUND_NOT_ELIGIBLE: 'Not eligible',
};

/**
 * Support context from GET /admin/subscriptions/:id/support-context.
 * Stripe ids stay on this card.
 */
export function AdminSubscriptionSupportCard({
  subscriptionId,
}: {
  readonly subscriptionId: number;
}): JSX.Element {
  const supportQuery = useAdminSubscriptionSupportContext(subscriptionId);
  if (supportQuery.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (supportQuery.isError) {
    return (
      <ErrorState
        title="Support context unavailable"
        message={getUserFacingErrorMessage(supportQuery.error)}
        onRetry={() => {
          void supportQuery.refetch();
        }}
      />
    );
  }
  const support = supportQuery.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support context</CardTitle>
        <CardDescription>
          Access, refund eligibility, and payment failure come from the support API. Stripe ids are
          technical support information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label="Plan">{support.plan?.name ?? 'No plan'}</Item>
          <Item label="Interval">{support.plan?.interval ?? 'None'}</Item>
          <Item label="Amount">
            {formatPlanAmountLabel(support.plan?.amountCents, support.plan?.currency)}
          </Item>
          <Item label="Currency">{support.plan?.currency ?? 'None'}</Item>
          <Item label="Period start">{formatOptionalInstant(support.currentPeriodStart)}</Item>
          <Item label="Period end">{formatOptionalInstant(support.currentPeriodEnd)}</Item>
          <Item label="Trial start">{formatOptionalInstant(support.trialStartedAt)}</Item>
          <Item label="Trial end">{formatOptionalInstant(support.trialEndsAt)}</Item>
          <Item label="Reading access">
            <Badge variant={getReadingAccessVariant(support.readingAccessState)}>
              {formatReadingAccessState(support.readingAccessState)}
            </Badge>
          </Item>
          <Item label="Access explanation">
            {ACCESS_EXPLANATIONS[support.accessExplanationCode] ?? support.accessExplanationCode}
          </Item>
          <Item label="Refund eligibility">
            {support.refundIneligibilityCode === null
              ? 'Not returned'
              : (REFUND_LABELS[support.refundIneligibilityCode] ?? support.refundIneligibilityCode)}
          </Item>
        </dl>
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Stripe identifiers</h3>
          <IdentifierRow label="Stripe Customer ID" value={support.stripeCustomerId} />
          <IdentifierRow label="Stripe Subscription ID" value={support.stripeSubscriptionId} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Latest payment failure</h3>
          {support.latestPaymentFailure === null ? (
            <p className="text-sm text-muted-foreground">No payment failure is recorded.</p>
          ) : (
            <p className="text-sm">
              {`${formatWireInstant(support.latestPaymentFailure.createdAt)} · invoice ${support.latestPaymentFailure.invoiceStatus ?? 'status not recorded'}`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IdentifierRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null;
}): JSX.Element {
  if (value === null || value === '') {
    return (
      <p className="text-sm">
        <span className="text-muted-foreground">{`${label}: `}</span>
        Not stored
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="font-mono text-sm">
        <span className="font-sans text-muted-foreground">{`${label}: `}</span>
        {value}
      </p>
      <CopyTextButton value={value} label={`Copy ${label}`} />
    </div>
  );
}

function Item({
  label,
  children,
}: {
  readonly label: string;
  readonly children: JSX.Element | string;
}): JSX.Element {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function formatOptionalInstant(value: string | null): string {
  return hasWireInstant(value) ? formatWireInstant(value) : 'Not set';
}

function getReadingAccessVariant(
  state: string,
): 'success' | 'warning' | 'secondary' {
  if (state === 'paid') {
    return 'success';
  }
  if (state === 'trial') {
    return 'warning';
  }
  return 'secondary';
}
