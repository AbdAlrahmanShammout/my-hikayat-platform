import type { JSX } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminInvitationRecord } from '@/features/invitations/api/admin-invitation-record';
import {
  AdminInvitationRevokeDialog,
  formatResendError,
} from '@/features/invitations/components/admin-invitation-revoke-dialog';
import { useResendAdminInvitation } from '@/features/invitations/hooks/use-resend-admin-invitation';
import { formatInvitationStatusLabel } from '@/features/invitations/lib/format-invitation-status-label';
import { formatUserEmailLabel } from '@/lib/format-user-email-label';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminInvitationsTableProps = {
  readonly invitations: readonly AdminInvitationRecord[];
  readonly onChanged: (message: string) => void;
};

/**
 * Invitation table with resend and revoke. Lifecycle rules stay on the server.
 */
export function AdminInvitationsTable({
  invitations,
  onChanged,
}: AdminInvitationsTableProps): JSX.Element {
  const resendInvitation = useResendAdminInvitation();
  return (
    <div className="space-y-4">
      {resendInvitation.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{formatResendError(resendInvitation.error)}</AlertDescription>
        </Alert>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-card">Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Last sent</TableHead>
            <TableHead>Resends</TableHead>
            <TableHead>Invited by</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              isResending={resendInvitation.isPending && resendInvitation.variables === invitation.id}
              onResend={() => {
                resendInvitation.mutate(invitation.id, {
                  onSuccess: () => {
                    onChanged(`Invitation resent to ${invitation.email}.`);
                  },
                });
              }}
              onRevoked={() => {
                onChanged(`Invitation revoked for ${invitation.email}.`);
              }}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvitationRow({
  invitation,
  isResending,
  onResend,
  onRevoked,
}: {
  readonly invitation: AdminInvitationRecord;
  readonly isResending: boolean;
  readonly onResend: () => void;
  readonly onRevoked: () => void;
}): JSX.Element {
  const [isRevokeOpen, setIsRevokeOpen] = useState<boolean>(false);
  const canResend: boolean = invitation.status === 'pending' && !isExpired(invitation.expiresAt);
  const canRevoke: boolean = invitation.status === 'pending';
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 max-w-56 truncate bg-card font-medium" title={invitation.email}>
        {invitation.email}
      </TableCell>
      <TableCell>
        <Badge variant={getInvitationStatusVariant(displayStatus(invitation))}>
          {formatInvitationStatusLabel(displayStatus(invitation))}
        </Badge>
      </TableCell>
      <TableCell>{formatWireInstant(invitation.expiresAt)}</TableCell>
      <TableCell>
        {hasWireInstant(invitation.lastSentAt) ? formatWireInstant(invitation.lastSentAt) : 'Not sent'}
      </TableCell>
      <TableCell>{String(invitation.resendCount ?? 0)}</TableCell>
      <TableCell>
        <Link className="underline-offset-4 hover:underline" to={`/admin/users/${invitation.invitedByUserId}`}>
          {formatUserEmailLabel({
            userId: invitation.invitedByUserId,
            user: invitation.invitedBy,
          })}
        </Link>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {canResend ? (
            <Button type="button" variant="outline" size="sm" disabled={isResending} onClick={onResend}>
              {isResending ? 'Resending…' : 'Resend'}
            </Button>
          ) : null}
          {canRevoke ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRevokeOpen(true)}>
              Revoke
            </Button>
          ) : null}
        </div>
        <AdminInvitationRevokeDialog
          invitationId={invitation.id}
          email={invitation.email}
          open={isRevokeOpen}
          onOpenChange={setIsRevokeOpen}
          onRevoked={onRevoked}
        />
      </TableCell>
    </TableRow>
  );
}

function displayStatus(invitation: AdminInvitationRecord): string {
  if (invitation.status === 'pending' && isExpired(invitation.expiresAt)) {
    return 'expired';
  }
  return invitation.status;
}

function getInvitationStatusVariant(
  status: string,
): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'accepted') {
    return 'success';
  }
  if (status === 'pending') {
    return 'warning';
  }
  if (status === 'revoked' || status === 'expired') {
    return 'destructive';
  }
  return 'secondary';
}

function isExpired(expiresAt: string): boolean {
  const expiresAtMs: number = Date.parse(expiresAt);
  return Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();
}
