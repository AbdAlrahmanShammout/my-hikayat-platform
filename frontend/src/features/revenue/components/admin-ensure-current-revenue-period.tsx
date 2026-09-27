import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnsureCurrentAdminRevenuePeriod } from '@/features/revenue/hooks/use-ensure-current-admin-revenue-period';

/**
 * POST /admin/revenue-periods/current. Opens this UTC month if missing.
 */
export function AdminEnsureCurrentRevenuePeriod(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const ensureMutation = useEnsureCurrentAdminRevenuePeriod();
  const errorMessage: string | undefined =
    ensureMutation.error === null ? undefined : getUserFacingErrorMessage(ensureMutation.error);
  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        Open current month
      </Button>
      <Dialog open={isOpen} onOpenChange={ensureMutation.isPending ? undefined : setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open current UTC month</DialogTitle>
            <DialogDescription>
              Opens this UTC month if it does not exist and closes elapsed open periods. An existing
              month is returned as-is.
            </DialogDescription>
          </DialogHeader>
          {errorMessage !== undefined ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={ensureMutation.isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={ensureMutation.isPending}
              onClick={() => {
                void submitEnsureCurrent(ensureMutation.mutateAsync, (revenuePeriodId) => {
                  setIsOpen(false);
                  void navigate(`/admin/revenue/${revenuePeriodId}`);
                });
              }}
            >
              {ensureMutation.isPending ? 'Opening…' : 'Open month'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

async function submitEnsureCurrent(
  mutateAsync: ReturnType<typeof useEnsureCurrentAdminRevenuePeriod>['mutateAsync'],
  onReady: (revenuePeriodId: number) => void,
): Promise<void> {
  const period = await mutateAsync();
  onReady(period.id);
}
