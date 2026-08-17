import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Subscription management placeholder until STEP 5.
 */
export function AdminSubscriptionsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Cancel without a refund. Access lasts until currentPeriodEnd."
      />
      <EmptyState
        title="Subscriptions are not available yet"
        description="STEP 5 will list subscriptions from the API. Entitlement is not recomputed in the browser."
      />
    </>
  );
}
