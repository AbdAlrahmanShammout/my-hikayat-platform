import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Collection editor placeholder until STEP 6.
 */
export function AdminCollectionsPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Collections" description="Curate membership and order." />
      <EmptyState
        title="Collections are not available yet"
        description="STEP 6 will add collection CRUD. Unpublished books remain visible in admin membership."
      />
    </>
  );
}
