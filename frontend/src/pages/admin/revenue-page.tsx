import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Revenue-period management placeholder until STEP 8.
 */
export function AdminRevenuePage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Revenue periods"
        description="Pool amount is admin-set cents. Platform cut belongs to the period."
      />
      <EmptyState
        title="Revenue periods are not available yet"
        description="STEP 8 will list and edit periods. Do not derive the pool from Stripe in the UI."
      />
    </>
  );
}
