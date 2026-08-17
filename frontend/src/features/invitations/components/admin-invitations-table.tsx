import type { JSX } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatInvitationStatusLabel } from '@/features/invitations/lib/format-invitation-status-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminInvitationsTableProps = {
  readonly invitations: ReadonlyArray<components['schemas']['AdminInvitationResponse']>;
};

/**
 * Pending invitation table. Values come from GET /admin/invitations.
 */
export function AdminInvitationsTable({ invitations }: AdminInvitationsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Invited by</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell className="font-medium">{invitation.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{formatInvitationStatusLabel(invitation.status)}</Badge>
            </TableCell>
            <TableCell>{formatWireInstant(invitation.expiresAt)}</TableCell>
            <TableCell>
              <Link
                className="underline-offset-4 hover:underline"
                to={`/admin/users/${invitation.invitedByUserId}`}
              >
                User {invitation.invitedByUserId}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
