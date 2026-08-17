import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Catalog review placeholder until STEP 3.
 */
export function AdminBooksPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Books"
        description="Review publishing status, metadata, and catalog visibility."
      />
      <EmptyState
        title="Book review is not available yet"
        description="STEP 3 will add the review table against GET /admin/books. Reject has no reason field."
      />
    </>
  );
}
