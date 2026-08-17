import type { JSX } from 'react';
import { useNavigate } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnsureCurrentAdminRevenuePeriod } from '@/features/revenue/hooks/use-ensure-current-admin-revenue-period';

/**
 * POST /admin/revenue-periods/current. Opens this UTC month if missing.
 */
export function AdminEnsureCurrentRevenuePeriod(): JSX.Element {
  const navigate = useNavigate();
  const ensureMutation = useEnsureCurrentAdminRevenuePeriod();
  const errorMessage: string | undefined =
    ensureMutation.error === null ? undefined : getUserFacingErrorMessage(ensureMutation.error);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current UTC month</CardTitle>
        <CardDescription>
          Opens this UTC month if it does not exist and closes elapsed open periods. An existing
          month is returned as-is.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorMessage !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={ensureMutation.isPending}
          onClick={() => {
            void submitEnsureCurrent(ensureMutation.mutateAsync, (revenuePeriodId) => {
              void navigate(`/admin/revenue/${revenuePeriodId}`);
            });
          }}
        >
          {ensureMutation.isPending ? 'Opening…' : 'Open current UTC month'}
        </Button>
      </CardContent>
    </Card>
  );
}

async function submitEnsureCurrent(
  mutateAsync: ReturnType<typeof useEnsureCurrentAdminRevenuePeriod>['mutateAsync'],
  onReady: (revenuePeriodId: number) => void,
): Promise<void> {
  const period = await mutateAsync();
  onReady(period.id);
}
