import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminCollectionsPanel } from '@/features/collections/components/admin-collections-panel';

/**
 * Admin collections list. Create, then edit membership on the detail screen.
 */
export function AdminCollectionsPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Collections" description="Curate membership and order." />
      <AdminCollectionsPanel />
    </>
  );
}
