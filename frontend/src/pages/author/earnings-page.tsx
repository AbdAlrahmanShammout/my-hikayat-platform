import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AuthorEarningsPanel } from '@/features/earnings/components/author-earnings-panel';

/**
 * Author earnings. Cents come from GET /author/earnings and GET /author/earnings/trend.
 */
export function AuthorEarningsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Earnings"
        description="Period and per-book cents are displayed from the API. Payouts are not recalculated here."
      />
      <AuthorEarningsPanel />
    </>
  );
}
