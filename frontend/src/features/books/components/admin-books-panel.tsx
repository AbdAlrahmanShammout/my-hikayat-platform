import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminBooksFilters } from '@/features/books/components/admin-books-filters';
import { AdminBooksTable } from '@/features/books/components/admin-books-table';
import { AdminBooksTableSkeleton } from '@/features/books/components/admin-books-table-skeleton';
import { useAdminBooksList } from '@/features/books/hooks/use-admin-books-list';
import {
  buildAdminBooksListSearchParams,
  EMPTY_ADMIN_BOOKS_LIST_SEARCH,
  parseAdminBooksListSearch,
  type AdminBooksListSearch,
} from '@/features/books/lib/parse-admin-books-list-search';

type AdminBooksPanelProps = {
  readonly ownerId?: number;
};

/**
 * Filterable GET /admin/books table with server-side paging.
 * Pass ownerId to list one publisher account's books.
 */
export function AdminBooksPanel({ ownerId }: AdminBooksPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminBooksListSearch = parseAdminBooksListSearch(searchParams);
  const booksQuery = useAdminBooksList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    q: listSearch.q,
    categoryId: listSearch.categoryIds,
    authorName: listSearch.authorName,
    publisherName: listSearch.publisherName,
    ownerId: ownerId === undefined ? listSearch.ownerIds : [ownerId],
    bookType: listSearch.bookTypes,
    layoutType: listSearch.layoutTypes,
    publishingStatus: listSearch.publishingStatuses,
    processingStatus: listSearch.processingStatuses,
    catalogVisible: listSearch.catalogVisible,
    sortBy: listSearch.sortBy,
    sortOrder: listSearch.sortOrder,
  });
  const replaceSearch = (nextSearch: AdminBooksListSearch): void => {
    setSearchParams(buildAdminBooksListSearchParams(searchParams, nextSearch), { replace: true });
  };
  const recordCount: number | undefined = booksQuery.data?.total;
  return (
    <div>
      {ownerId === undefined ? (
        <CatalogBooksHeading total={recordCount} />
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Every book this publisher account owns, including published titles and books still in
          progress. EPUB creator and EPUB publisher stay on the book record.
        </p>
      )}
      <AdminBooksFilters
        key={serializeSearch(listSearch)}
        value={listSearch}
        lockOwner={ownerId !== undefined}
        onApply={(nextSearch) => {
          replaceSearch(ownerId === undefined ? nextSearch : { ...nextSearch, ownerIds: [] });
        }}
        onClear={() => {
          replaceSearch(EMPTY_ADMIN_BOOKS_LIST_SEARCH);
        }}
      />
      {renderBooksPanelBody(booksQuery, listSearch, replaceSearch, ownerId === undefined)}
    </div>
  );
}

function CatalogBooksHeading({ total }: { readonly total: number | undefined }): JSX.Element {
  const subtitle: string = total === undefined ? 'Catalog records' : `${total} catalog records`;
  return (
    <div className="-mx-4 -mt-4 mb-3.5 flex h-[52px] items-center border-b border-border bg-card px-6 md:-mx-6 md:-mt-6">
      <h1 className="font-display text-base font-semibold text-foreground">Books</h1>
      <span className="ml-1.5 text-xs text-muted-foreground">— {subtitle}</span>
    </div>
  );
}

function renderBooksPanelBody(
  booksQuery: ReturnType<typeof useAdminBooksList>,
  listSearch: AdminBooksListSearch,
  replaceSearch: (nextSearch: AdminBooksListSearch) => void,
  showOwner: boolean,
): JSX.Element {
  if (booksQuery.isPending) {
    return <AdminBooksTableSkeleton />;
  }
  if (booksQuery.isError) {
    return (
      <ErrorState
        title={booksQuery.error instanceof ApiError && booksQuery.error.statusCode === 422
          ? 'Those filters were rejected'
          : undefined}
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
        title="No books match these filters"
        description="Adjust the catalog filters and choose Apply, or clear them."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminBooksTable books={booksQuery.data.books} showOwner={showOwner} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={booksQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ ...listSearch, offset });
        }}
      />
    </div>
  );
}

function serializeSearch(search: AdminBooksListSearch): string {
  return JSON.stringify(search);
}
