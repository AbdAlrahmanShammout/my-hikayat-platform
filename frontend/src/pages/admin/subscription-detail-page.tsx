import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AdminSubscriptionActions } from '@/features/subscriptions/components/admin-subscription-actions';
import { AdminSubscriptionDetailSummary } from '@/features/subscriptions/components/admin-subscription-detail-summary';
import { useAdminSubscription } from '@/features/subscriptions/hooks/use-admin-subscription';
import { formatSubscriptionPlanLabel } from '@/features/subscriptions/lib/format-subscription-plan-label';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Admin subscription detail: plan, period dates, and cancel without refund.
 */
export function AdminSubscriptionDetailPage(): JSX.Element {
  const { subscriptionId: subscriptionIdParam } = useParams();
  const subscriptionId: number | null = parsePositiveInt(subscriptionIdParam);
  if (subscriptionId === null) {
    return (
      <>
        <PageHeader
          title="Subscription"
          description="Cancel without a refund. Access lasts until currentPeriodEnd."
        />
        <ErrorState
          title="Invalid subscription id"
          message="The subscription id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminSubscriptionDetailContent subscriptionId={subscriptionId} />;
}

function AdminSubscriptionDetailContent({
  subscriptionId,
}: {
  readonly subscriptionId: number;
}): JSX.Element {
  const subscriptionQuery = useAdminSubscription(subscriptionId);
  if (subscriptionQuery.isPending) {
    return (
      <>
        <PageHeader
          title="Subscription"
          description="Cancel without a refund. Access lasts until currentPeriodEnd."
        />
        <PageSkeleton />
      </>
    );
  }
  if (subscriptionQuery.isError) {
    return (
      <>
        <PageHeader
          title="Subscription"
          description="Cancel without a refund. Access lasts until currentPeriodEnd."
          actions={backToSubscriptionsAction()}
        />
        <ErrorState
          message={getSubscriptionLoadMessage(subscriptionQuery.error)}
          onRetry={() => {
            void subscriptionQuery.refetch();
          }}
        />
      </>
    );
  }
  const subscription = subscriptionQuery.data;
  return (
    <>
      <PageHeader
        title={formatSubscriptionPlanLabel(subscription)}
        description="Cancel without a refund. Access lasts until currentPeriodEnd."
        actions={backToSubscriptionsAction()}
      />
      <div className="space-y-6">
        <AdminSubscriptionActions subscription={subscription} />
        <AdminSubscriptionDetailSummary subscription={subscription} />
      </div>
    </>
  );
}

function backToSubscriptionsAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/subscriptions">Back to subscriptions</Link>
    </Button>
  );
}

function getSubscriptionLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This subscription was not found.';
  }
  return getUserFacingErrorMessage(error);
}
