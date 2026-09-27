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

type AdminBooksPanelProps = {
  readonly ownerId?: number;
};

/**
 * Filterable GET /admin/books table with server-side paging.
 * Pass ownerId to list one publisher's books, including work still in progress.
 */
export function AdminBooksPanel({ ownerId }: AdminBooksPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminBooksListSearch = parseAdminBooksListSearch(searchParams);
  const booksQuery = useAdminBooksList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    publishingStatus: listSearch.publishingStatus,
    ...(ownerId === undefined ? {} : { ownerId }),
  });
  const replaceSearch = (nextSearch: AdminBooksListSearch): void => {
    setSearchParams(buildListSearchParams(searchParams, nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      {ownerId !== undefined ? (
        <p className="text-sm text-muted-foreground">
          Every book this publisher owns, including published titles and books still in progress.
        </p>
      ) : null}
      <AdminBooksStatusFilter
        value={listSearch.publishingStatus}
        onChange={(publishingStatus: BookPublishingStatusFilter | undefined) => {
          replaceSearch({ publishingStatus, offset: 0 });
        }}
      />
      {renderBooksPanelBody(booksQuery, listSearch, replaceSearch, ownerId)}
    </div>
  );
}

function renderBooksPanelBody(
  booksQuery: ReturnType<typeof useAdminBooksList>,
  listSearch: AdminBooksListSearch,
  replaceSearch: (nextSearch: AdminBooksListSearch) => void,
  ownerId: number | undefined,
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
        description={describeEmptyBooks(listSearch, ownerId)}
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminBooksTable books={booksQuery.data.books} showOwner={ownerId === undefined} />
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

function describeEmptyBooks(search: AdminBooksListSearch, ownerId: number | undefined): string {
  if (search.publishingStatus !== undefined) {
    return 'Try another publishing status, or show all statuses.';
  }
  if (ownerId !== undefined) {
    return 'This publisher has no books yet.';
  }
  return 'GET /admin/books returned an empty list.';
}

function buildListSearchParams(
  currentParams: URLSearchParams,
  search: AdminBooksListSearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(currentParams);
  if (search.publishingStatus !== undefined) {
    params.set('publishingStatus', search.publishingStatus);
  } else {
    params.delete('publishingStatus');
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  } else {
    params.delete('offset');
  }
  return params;
}
