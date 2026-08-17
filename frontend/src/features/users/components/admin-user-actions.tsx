import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useDeleteAdminUser } from '@/features/users/hooks/use-delete-admin-user';
import type { AdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';
import type { components } from '@/generated/admin';

type AdminUserActionsProps = {
  readonly user: components['schemas']['UserResponse'];
  readonly availability: AdminUserActionAvailability;
};

/**
 * Soft-delete for a managed user. Self-management and last-admin are disabled in UX.
 */
export function AdminUserActions({ user, availability }: AdminUserActionsProps): JSX.Element {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const deleteMutation = useDeleteAdminUser();
  const deleteButton = (
    <Button
      type="button"
      variant="destructive"
      disabled={!availability.canDelete || deleteMutation.isPending}
      onClick={() => {
        deleteMutation.reset();
        setIsConfirmOpen(true);
      }}
    >
      Delete
    </Button>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>Soft-delete removes the account from admin lists.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {availability.deleteDisabledReason === null || availability.canDelete ? (
          deleteButton
        ) : (
          <Tooltip label={availability.deleteDisabledReason}>{deleteButton}</Tooltip>
        )}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Delete this user?"
          description="This is a soft-delete. The account will leave the admin list."
          confirmLabel="Delete"
          confirmVariant="destructive"
          isPending={deleteMutation.isPending}
          errorMessage={
            deleteMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(deleteMutation.error)
          }
          onOpenChange={setIsConfirmOpen}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(user.id);
            setIsConfirmOpen(false);
            void navigate('/admin/users');
          }}
        />
      </CardContent>
    </Card>
  );
}
