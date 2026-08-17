import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useCloseAdminRevenuePeriod } from '@/features/revenue/hooks/use-close-admin-revenue-period';
import { getAdminRevenuePeriodActionAvailability } from '@/features/revenue/lib/get-admin-revenue-period-action-availability';
import type { components } from '@/generated/admin';

type AdminRevenuePeriodActionsProps = {
  readonly period: components['schemas']['RevenuePeriodResponse'];
};

/**
 * Close a revenue period. Platform cut cannot change after close; pool still can.
 */
export function AdminRevenuePeriodActions({ period }: AdminRevenuePeriodActionsProps): JSX.Element {
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const closeMutation = useCloseAdminRevenuePeriod();
  const availability = getAdminRevenuePeriodActionAvailability(period);
  const closeButton = (
    <Button
      type="button"
      variant="destructive"
      disabled={!availability.canClose || closeMutation.isPending}
      onClick={() => {
        closeMutation.reset();
        setIsConfirmOpen(true);
      }}
    >
      Close period
    </Button>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Close</CardTitle>
        <CardDescription>
          Closing is idempotent. Platform cut cannot change after close. The pool can still be set.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {availability.closeDisabledReason === null || availability.canClose ? (
          closeButton
        ) : (
          <Tooltip label={availability.closeDisabledReason}>{closeButton}</Tooltip>
        )}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Close this revenue period?"
          description="Platform cut cannot change after close. The pool amount can still be updated."
          confirmLabel="Close period"
          confirmVariant="destructive"
          isPending={closeMutation.isPending}
          errorMessage={
            closeMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(closeMutation.error)
          }
          onOpenChange={setIsConfirmOpen}
          onConfirm={async () => {
            await closeMutation.mutateAsync(period.id);
            setIsConfirmOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}
