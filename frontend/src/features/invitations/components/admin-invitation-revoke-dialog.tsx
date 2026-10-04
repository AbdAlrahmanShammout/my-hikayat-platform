import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { ApiError } from '@/api/api-error';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRevokeAdminInvitation } from '@/features/invitations/hooks/use-revoke-admin-invitation';

type AdminInvitationRevokeDialogProps = {
  readonly invitationId: number;
  readonly email: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onRevoked: () => void;
};

/**
 * Confirms revoke and keeps the optional reason if the request fails.
 */
export function AdminInvitationRevokeDialog({
  invitationId,
  email,
  open,
  onOpenChange,
  onRevoked,
}: AdminInvitationRevokeDialogProps): JSX.Element {
  const [reason, setReason] = useState<string>('');
  const revokeInvitation = useRevokeAdminInvitation();
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (revokeInvitation.isPending) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke invitation</DialogTitle>
          <DialogDescription>
            {`Revoke the invitation for ${email}. The backend decides whether this invitation can be revoked.`}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const trimmed: string = reason.trim();
            revokeInvitation.mutate(
              { invitationId, reason: trimmed === '' ? undefined : trimmed },
              {
                onSuccess: () => {
                  setReason('');
                  onRevoked();
                  onOpenChange(false);
                },
              },
            );
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={`revoke-reason-${String(invitationId)}`}>Reason (optional)</Label>
            <Textarea
              id={`revoke-reason-${String(invitationId)}`}
              value={reason}
              maxLength={2000}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          {revokeInvitation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{getUserFacingErrorMessage(revokeInvitation.error)}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={revokeInvitation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={revokeInvitation.isPending}>
              {revokeInvitation.isPending ? 'Revoking…' : 'Revoke invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function formatResendError(error: unknown): string {
  if (error instanceof ApiError && error.statusCode === 429) {
    if (error.retryAfterSeconds !== undefined) {
      return `Wait ${String(error.retryAfterSeconds)} seconds before resending this invitation.`;
    }
    return 'Wait before resending this invitation.';
  }
  return getUserFacingErrorMessage(error);
}
