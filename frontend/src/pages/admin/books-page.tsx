import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminBooksPanel } from '@/features/books/components/admin-books-panel';

/**
 * Admin books list. Filters and paging are query parameters on GET /admin/books.
 */
export function AdminBooksPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Books"
        description="Review publishing status, metadata, and catalog visibility."
      />
      <AdminBooksPanel />
    </>
  );
}
