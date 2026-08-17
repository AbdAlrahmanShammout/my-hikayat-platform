import type { JSX } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUserRoleLabel } from '@/features/users/lib/format-user-role-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';

type AdminUserDetailSummaryProps = {
  readonly user: components['schemas']['UserResponse'];
};

/**
 * Read-only user fields from GET /admin/users/:id.
 */
export function AdminUserDetailSummary({ user }: AdminUserDetailSummaryProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Email">{user.email}</SummaryItem>
          <SummaryItem label="Role">
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {formatUserRoleLabel(user.role)}
            </Badge>
          </SummaryItem>
          <SummaryItem label="Publisher">{user.isPublisher ? 'Yes' : 'No'}</SummaryItem>
          <SummaryItem label="User id">{String(user.id)}</SummaryItem>
          <SummaryItem label="Created">{formatWireInstant(user.createdAt)}</SummaryItem>
          <SummaryItem label="Updated">{formatWireInstant(user.updatedAt)}</SummaryItem>
        </dl>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  children,
}: {
  readonly label: string;
  readonly children: JSX.Element | string;
}): JSX.Element {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
