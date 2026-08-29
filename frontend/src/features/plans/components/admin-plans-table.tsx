import type { JSX } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminPlanEditDialog } from '@/features/plans/components/admin-plan-edit-dialog';
import { formatPlanAmountLabel } from '@/features/plans/lib/format-plan-amount-label';
import type { components } from '@/generated/admin';

type AdminPlansTableProps = {
  readonly plans: ReadonlyArray<components['schemas']['PlanResponse']>;
};

/**
 * Admin plans table with Stripe price and amount from the backend.
 */
export function AdminPlansTable({ plans }: AdminPlansTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Stripe price</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell>
              <div className="font-medium">{plan.name}</div>
              <div className="text-muted-foreground text-sm">{plan.description}</div>
            </TableCell>
            <TableCell>{plan.kind}</TableCell>
            <TableCell className="font-mono text-sm">{plan.stripePriceId ?? '—'}</TableCell>
            <TableCell>{formatPlanAmountLabel(plan.amountCents, plan.currency)}</TableCell>
            <TableCell className="text-right">
              <AdminPlanEditDialog plan={plan} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
