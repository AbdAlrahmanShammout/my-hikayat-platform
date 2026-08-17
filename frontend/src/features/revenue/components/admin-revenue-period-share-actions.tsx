import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useAggregateAdminPeriodEngagement } from '@/features/revenue/hooks/use-aggregate-admin-period-engagement';
import { useCalculateAdminPeriodRevenue } from '@/features/revenue/hooks/use-calculate-admin-period-revenue';
import { getAdminRevenueCalculateAvailability } from '@/features/revenue/lib/get-admin-revenue-calculate-availability';
import type { components } from '@/generated/admin';

type AdminRevenuePeriodShareActionsProps = {
  readonly period: components['schemas']['RevenuePeriodResponse'];
};

/**
 * Calculate author shares and refresh engagement. Totals come from the API.
 */
export function AdminRevenuePeriodShareActions({
  period,
}: AdminRevenuePeriodShareActionsProps): JSX.Element {
  const [isCalculateOpen, setIsCalculateOpen] = useState<boolean>(false);
  const calculateMutation = useCalculateAdminPeriodRevenue();
  const engagementMutation = useAggregateAdminPeriodEngagement();
  const availability = getAdminRevenueCalculateAvailability(period);
  const calculateButton = (
    <Button
      type="button"
      disabled={!availability.canCalculate || calculateMutation.isPending}
      onClick={() => {
        calculateMutation.reset();
        setIsCalculateOpen(true);
      }}
    >
      Calculate shares
    </Button>
  );
  const engagementError: string | undefined =
    engagementMutation.error === null
      ? undefined
      : getUserFacingErrorMessage(engagementMutation.error);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shares and engagement</CardTitle>
        <CardDescription>
          Calculate requires poolAmountCents, refreshes engagement, writes shares, and appends
          REVENUE_CALCULATED. Refresh engagement does not write that audit event.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {engagementError !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{engagementError}</AlertDescription>
          </Alert>
        ) : null}
        {engagementMutation.isSuccess ? (
          <Alert>
            <AlertDescription>Weighted engagement refreshed.</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {availability.calculateDisabledReason === null || availability.canCalculate ? (
            calculateButton
          ) : (
            <Tooltip label={availability.calculateDisabledReason}>{calculateButton}</Tooltip>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={engagementMutation.isPending || calculateMutation.isPending}
            onClick={() => {
              engagementMutation.reset();
              void engagementMutation.mutateAsync(period.id);
            }}
          >
            {engagementMutation.isPending ? 'Refreshing…' : 'Refresh engagement'}
          </Button>
        </div>
        <ConfirmDialog
          open={isCalculateOpen}
          title="Calculate author shares?"
          description="This refreshes engagement, writes shares, and appends a REVENUE_CALCULATED audit row. Recalculating is allowed and creates another audit row. Totals are not recomputed in the browser."
          confirmLabel="Calculate shares"
          isPending={calculateMutation.isPending}
          errorMessage={
            calculateMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(calculateMutation.error)
          }
          onOpenChange={setIsCalculateOpen}
          onConfirm={async () => {
            await calculateMutation.mutateAsync(period.id);
            setIsCalculateOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}
