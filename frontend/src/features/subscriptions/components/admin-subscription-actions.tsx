import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useCancelAdminSubscription } from '@/features/subscriptions/hooks/use-cancel-admin-subscription';
import { useRefundAdminSubscription } from '@/features/subscriptions/hooks/use-refund-admin-subscription';
import { getAdminSubscriptionActionAvailability } from '@/features/subscriptions/lib/get-admin-subscription-action-availability';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type SubscriptionAction = 'cancel' | 'refund';

type AdminSubscriptionActionsProps = {
  readonly subscription: components['schemas']['SubscriptionResponse'];
};

/**
 * Cancel without refund, or refund using the API 7-day activation window.
 */
export function AdminSubscriptionActions({
  subscription,
}: AdminSubscriptionActionsProps): JSX.Element {
  const [openAction, setOpenAction] = useState<SubscriptionAction | null>(null);
  const cancelMutation = useCancelAdminSubscription();
  const refundMutation = useRefundAdminSubscription();
  const availability = getAdminSubscriptionActionAvailability(subscription);
  const isBusy: boolean = cancelMutation.isPending || refundMutation.isPending;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing actions</CardTitle>
        <CardDescription>
          Cancel leaves access until currentPeriodEnd. Refund uses the same 7-day activation window
          as the reader refund. This screen does not decide eligibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <ActionTrigger
          label="Cancel without refund"
          canRun={availability.canCancel}
          disabledReason={availability.cancelDisabledReason}
          isBusy={isBusy}
          variant="outline"
          onClick={() => {
            cancelMutation.reset();
            setOpenAction('cancel');
          }}
        />
        <ActionTrigger
          label="Refund"
          canRun={availability.canRefund}
          disabledReason={availability.refundDisabledReason}
          isBusy={isBusy}
          variant="destructive"
          onClick={() => {
            refundMutation.reset();
            setOpenAction('refund');
          }}
        />
        {openAction === 'cancel' ? (
          <ConfirmDialog
            open={true}
            title="Cancel this subscription?"
            description={buildCancelDescription(subscription)}
            confirmLabel="Cancel without refund"
            confirmVariant="destructive"
            isPending={isBusy}
            errorMessage={
              cancelMutation.error === null
                ? undefined
                : getUserFacingErrorMessage(cancelMutation.error)
            }
            onOpenChange={(open: boolean) => {
              if (!open) {
                setOpenAction(null);
              }
            }}
            onConfirm={async () => {
              await cancelMutation.mutateAsync(subscription.id);
              setOpenAction(null);
            }}
          />
        ) : null}
        {openAction === 'refund' ? (
          <ConfirmDialog
            open={true}
            title="Refund this subscription?"
            description={buildRefundDescription(subscription)}
            confirmLabel="Refund"
            confirmVariant="destructive"
            isPending={isBusy}
            errorMessage={
              refundMutation.error === null
                ? undefined
                : getUserFacingErrorMessage(refundMutation.error)
            }
            onOpenChange={(open: boolean) => {
              if (!open) {
                setOpenAction(null);
              }
            }}
            onConfirm={async () => {
              await refundMutation.mutateAsync(subscription.id);
              setOpenAction(null);
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActionTrigger({
  label,
  canRun,
  disabledReason,
  isBusy,
  variant,
  onClick,
}: {
  readonly label: string;
  readonly canRun: boolean;
  readonly disabledReason: string | null;
  readonly isBusy: boolean;
  readonly variant: 'outline' | 'destructive';
  readonly onClick: () => void;
}): JSX.Element {
  const button = (
    <Button type="button" variant={variant} disabled={!canRun || isBusy} onClick={onClick}>
      {label}
    </Button>
  );
  if (disabledReason === null || canRun) {
    return button;
  }
  return <Tooltip label={disabledReason}>{button}</Tooltip>;
}

function buildCancelDescription(
  subscription: components['schemas']['SubscriptionResponse'],
): string {
  if (!hasWireInstant(subscription.currentPeriodEnd)) {
    return 'This cancels without a refund. The API does not currently report a currentPeriodEnd.';
  }
  return `This cancels without a refund. Access lasts until ${formatWireInstant(subscription.currentPeriodEnd)}, as returned by the API.`;
}

function buildRefundDescription(
  subscription: components['schemas']['SubscriptionResponse'],
): string {
  const activatedLabel: string = hasWireInstant(subscription.activatedAt)
    ? formatWireInstant(subscription.activatedAt)
    : 'Not set';
  return `The API applies the same 7-day activation window as the reader refund. Displayed activatedAt is ${activatedLabel}. If granted, currentPeriodEnd is closed immediately.`;
}
