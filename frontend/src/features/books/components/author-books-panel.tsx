import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { AUTHOR_LIST_PAGE_SIZE } from '@/config/author-list-page-size';
import { AdminBooksTableSkeleton } from '@/features/books/components/admin-books-table-skeleton';
import { AuthorBooksStatusFilter } from '@/features/books/components/author-books-status-filter';
import { AuthorBooksTable } from '@/features/books/components/author-books-table';
import { useAuthorBooksList } from '@/features/books/hooks/use-author-books-list';
import type { BookPublishingStatusFilter } from '@/features/books/lib/book-publishing-status-filters';
import {
  parseAuthorBooksListSearch,
  type AuthorBooksListSearch,
} from '@/features/books/lib/parse-author-books-list-search';

/**
 * Filterable GET /author/books table with server-side paging.
 */
export function AuthorBooksPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AuthorBooksListSearch = parseAuthorBooksListSearch(searchParams);
  const booksQuery = useAuthorBooksList({
    limit: AUTHOR_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    publishingStatus: listSearch.publishingStatus,
  });
  const replaceSearch = (nextSearch: AuthorBooksListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AuthorBooksStatusFilter
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
  booksQuery: ReturnType<typeof useAuthorBooksList>,
  listSearch: AuthorBooksListSearch,
  replaceSearch: (nextSearch: AuthorBooksListSearch) => void,
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
            ? 'GET /author/books returned an empty list.'
            : 'Try another publishing status, or show all statuses.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AuthorBooksTable books={booksQuery.data.books} />
      <ListPagination
        offset={listSearch.offset}
        limit={AUTHOR_LIST_PAGE_SIZE}
        total={booksQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ publishingStatus: listSearch.publishingStatus, offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AuthorBooksListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.publishingStatus !== undefined) {
    params.set('publishingStatus', search.publishingStatus);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
