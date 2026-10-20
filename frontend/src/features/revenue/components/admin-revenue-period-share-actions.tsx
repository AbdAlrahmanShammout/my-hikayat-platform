import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAggregateAdminPeriodEngagement } from '@/features/revenue/hooks/use-aggregate-admin-period-engagement';
import { useCalculateAdminPeriodRevenue } from '@/features/revenue/hooks/use-calculate-admin-period-revenue';
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
  const calculateButton = (
    <Button
      type="button"
      disabled={calculateMutation.isPending}
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
          Calculate reads the Stripe net for this month, writes each book share from completed
          reads, and appends REVENUE_CALCULATED. Refresh engagement stores reading time.
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
            <AlertDescription>Reading time refreshed.</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {calculateButton}
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
          description="This reads the Stripe net, writes shares from completed reads, and appends a REVENUE_CALCULATED audit row. Recalculating is allowed and creates another audit row."
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
