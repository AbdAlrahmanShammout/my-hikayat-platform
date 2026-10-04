import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminSearchPanel } from '@/features/search/components/admin-search-panel';

/**
 * Global admin search across the implemented result groups.
 */
export function AdminSearchPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Search"
        description="Users, books, EPUB authors, publisher accounts, categories, and subscriptions."
      />
      <AdminSearchPanel />
    </>
  );
}
