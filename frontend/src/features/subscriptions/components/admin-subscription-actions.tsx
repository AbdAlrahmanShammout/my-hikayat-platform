import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useCancelAdminSubscription } from '@/features/subscriptions/hooks/use-cancel-admin-subscription';
import { getAdminSubscriptionActionAvailability } from '@/features/subscriptions/lib/get-admin-subscription-action-availability';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminSubscriptionActionsProps = {
  readonly subscription: components['schemas']['SubscriptionResponse'];
};

/**
 * Cancel without a refund. There is no admin refund action in Part 1.
 */
export function AdminSubscriptionActions({
  subscription,
}: AdminSubscriptionActionsProps): JSX.Element {
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const cancelMutation = useCancelAdminSubscription();
  const availability = getAdminSubscriptionActionAvailability(subscription);
  const cancelButton = (
    <Button
      type="button"
      variant="destructive"
      disabled={!availability.canCancel || cancelMutation.isPending}
      onClick={() => {
        cancelMutation.reset();
        setIsConfirmOpen(true);
      }}
    >
      Cancel without refund
    </Button>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancel</CardTitle>
        <CardDescription>
          Access continues until currentPeriodEnd as returned by the API. This screen does not
          issue a refund.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {availability.cancelDisabledReason === null || availability.canCancel ? (
          cancelButton
        ) : (
          <Tooltip label={availability.cancelDisabledReason}>{cancelButton}</Tooltip>
        )}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Cancel this subscription?"
          description={buildCancelDescription(subscription)}
          confirmLabel="Cancel without refund"
          confirmVariant="destructive"
          isPending={cancelMutation.isPending}
          errorMessage={
            cancelMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(cancelMutation.error)
          }
          onOpenChange={setIsConfirmOpen}
          onConfirm={async () => {
            await cancelMutation.mutateAsync(subscription.id);
            setIsConfirmOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}

function buildCancelDescription(
  subscription: components['schemas']['SubscriptionResponse'],
): string {
  if (!hasWireInstant(subscription.currentPeriodEnd)) {
    return 'This cancels without a refund. The API does not currently report a currentPeriodEnd.';
  }
  return `This cancels without a refund. Access lasts until ${formatWireInstant(subscription.currentPeriodEnd)}, as returned by the API.`;
}
