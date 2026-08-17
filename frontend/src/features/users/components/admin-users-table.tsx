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

type AdminUsersTableProps = {
  readonly users: ReadonlyArray<components['schemas']['UserResponse']>;
};

/**
 * Admin user table. Values are displayed as returned by GET /admin/users.
 */
export function AdminUsersTable({ users }: AdminUsersTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Publisher</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {formatUserRoleLabel(user.role)}
              </Badge>
            </TableCell>
            <TableCell>{user.isPublisher ? 'Yes' : 'No'}</TableCell>
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
