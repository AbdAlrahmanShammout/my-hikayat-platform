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
import { formatSubscriptionEnumLabel } from '@/features/subscriptions/lib/format-subscription-enum-label';
import { formatSubscriptionPlanLabel } from '@/features/subscriptions/lib/format-subscription-plan-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminSubscriptionsTableProps = {
  readonly subscriptions: ReadonlyArray<components['schemas']['SubscriptionResponse']>;
};

/**
 * Admin subscription table. Entitlement is not recomputed from these fields.
 */
export function AdminSubscriptionsTable({
  subscriptions,
}: AdminSubscriptionsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Period end</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow key={subscription.id}>
            <TableCell className="font-medium">{formatSubscriptionPlanLabel(subscription)}</TableCell>
            <TableCell>
              <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                {formatSubscriptionEnumLabel(subscription.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <Link className="underline-offset-4 hover:underline" to={`/admin/users/${subscription.userId}`}>
                User #{subscription.userId}
              </Link>
            </TableCell>
            <TableCell>
              {hasWireInstant(subscription.currentPeriodEnd)
                ? formatWireInstant(subscription.currentPeriodEnd)
                : 'Not set'}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/subscriptions/${subscription.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
