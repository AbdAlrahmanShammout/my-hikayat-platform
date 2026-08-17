import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminBooksStatusFilter } from '@/features/books/components/admin-books-status-filter';
import { AdminBooksTable } from '@/features/books/components/admin-books-table';
import { AdminBooksTableSkeleton } from '@/features/books/components/admin-books-table-skeleton';
import { useAdminBooksList } from '@/features/books/hooks/use-admin-books-list';
import type { BookPublishingStatusFilter } from '@/features/books/lib/book-publishing-status-filters';
import {
  parseAdminBooksListSearch,
  type AdminBooksListSearch,
} from '@/features/books/lib/parse-admin-books-list-search';

/**
 * Filterable GET /admin/books table with server-side paging.
 */
export function AdminBooksPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminBooksListSearch = parseAdminBooksListSearch(searchParams);
  const booksQuery = useAdminBooksList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    publishingStatus: listSearch.publishingStatus,
  });
  const replaceSearch = (nextSearch: AdminBooksListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminBooksStatusFilter
        value={listSearch.publishingStatus}
        onChange={(publishingStatus: BookPublishingStatusFilter | undefined) => {
          replaceSearch({ publishingStatus, offset: 0 });
        }}
      />
      {renderBooksPanelBody(booksQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderBooksPanelBody(
  booksQuery: ReturnType<typeof useAdminBooksList>,
  listSearch: AdminBooksListSearch,
  replaceSearch: (nextSearch: AdminBooksListSearch) => void,
): JSX.Element {
  if (booksQuery.isPending) {
    return <AdminBooksTableSkeleton />;
  }
  if (booksQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(booksQuery.error)}
        onRetry={() => {
          void booksQuery.refetch();
        }}
      />
    );
  }
  if (booksQuery.data.books.length === 0) {
    return (
      <EmptyState
        title="No books match this filter"
        description={
          listSearch.publishingStatus === undefined
            ? 'GET /admin/books returned an empty list.'
            : 'Try another publishing status, or show all statuses.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminBooksTable books={booksQuery.data.books} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={booksQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ publishingStatus: listSearch.publishingStatus, offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminBooksListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.publishingStatus !== undefined) {
    params.set('publishingStatus', search.publishingStatus);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
