import type { JSX } from 'react';
import { Link } from 'react-router';

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
import { formatUserRoleLabel } from '@/features/users/lib/format-user-role-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

export type AdminUsersTableAudience = 'admins' | 'members';

type AdminUsersTableProps = {
  readonly audience: AdminUsersTableAudience;
  readonly users: ReadonlyArray<components['schemas']['AdminUserListItemResponse']>;
};

/**
 * Admin user table. Plan and last session come from GET /admin/users.
 */
export function AdminUsersTable({ audience, users }: AdminUsersTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          {audience === 'members' ? <TableHead>Role</TableHead> : null}
          <TableHead>Publisher</TableHead>
          {audience === 'admins' ? <TableHead>Last session</TableHead> : null}
          {audience === 'members' ? <TableHead>Plan</TableHead> : null}
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            {audience === 'members' ? (
              <TableCell>
                <Badge variant="secondary">{formatUserRoleLabel(user.role)}</Badge>
              </TableCell>
            ) : null}
            <TableCell>{user.isPublisher ? 'Yes' : 'No'}</TableCell>
            {audience === 'admins' ? (
              <TableCell>{formatWireInstant(user.lastSessionAt)}</TableCell>
            ) : null}
            {audience === 'members' ? (
              <TableCell>
                <MemberPlanCell plan={user.currentPlan} />
              </TableCell>
            ) : null}
            <TableCell>{formatWireInstant(user.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/users/${user.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MemberPlanCell({
  plan,
}: {
  readonly plan: components['schemas']['AdminUserCurrentPlanResponse'] | null | undefined;
}): JSX.Element {
  if (plan == null) {
    return <span className="text-sm text-muted-foreground">No plan</span>;
  }
  const isPaid: boolean = plan.kind === 'monthly_paid';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>{plan.name}</span>
      <Badge variant={isPaid ? 'success' : 'secondary'}>{isPaid ? 'Paid' : 'Free'}</Badge>
    </div>
  );
}
