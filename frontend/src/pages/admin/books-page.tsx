import type { JSX } from 'react';

import { AdminBooksPanel } from '@/features/books/components/admin-books-panel';

/**
 * Admin books list. Status and paging are query parameters on GET /admin/books.
 */
export function AdminBooksPage(): JSX.Element {
  return <AdminBooksPanel />;
}
