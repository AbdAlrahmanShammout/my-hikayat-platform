import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Category-weight editor placeholder until STEP 7.
 */
export function AdminCategoriesPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Categories"
        description="Adjust categoryWeight. Create, rename, and delete are not available."
      />
      <EmptyState
        title="Category weights are not available yet"
        description="STEP 7 will PATCH categoryWeight greater than 0. Changing a weight does not rewrite historical payouts until a period is recalculated."
      />
    </>
  );
}
