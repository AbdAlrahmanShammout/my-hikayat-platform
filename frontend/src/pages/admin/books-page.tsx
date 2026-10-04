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
        description="Search catalog metadata, then filter, sort, and page on the server. Keyword search does not read chapter or page text."
      />
      <AdminBooksPanel />
    </>
  );
}
