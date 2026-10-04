import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminPublishersPanel } from '@/features/publishers/components/admin-publishers-panel';

/**
 * Publisher account directory.
 */
export function AdminPublishersPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Publisher accounts"
        description="Users with publisher capability. This is not the EPUB creator or EPUB publisher field."
      />
      <AdminPublishersPanel />
    </>
  );
}
