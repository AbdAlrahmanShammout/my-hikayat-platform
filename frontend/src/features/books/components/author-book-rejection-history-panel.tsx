import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AUTHOR_LIST_PAGE_SIZE } from '@/config/author-list-page-size';
import { AdminBookRejectionHistoryTableSkeleton } from '@/features/books/components/admin-book-rejection-history-table-skeleton';
import { AuthorBookRejectionHistoryTable } from '@/features/books/components/author-book-rejection-history-table';
import { useAuthorBookRejectionHistory } from '@/features/books/hooks/use-author-book-rejection-history';
import {
  parseAuthorBookRejectionHistorySearch,
  type AuthorBookRejectionHistorySearch,
} from '@/features/books/lib/parse-author-book-rejection-history-search';

type AuthorBookRejectionHistoryPanelProps = {
  readonly bookId: number;
};

/**
 * GET /author/books/:id/rejection-history. Empty when the book has never been rejected.
 */
export function AuthorBookRejectionHistoryPanel({
  bookId,
}: AuthorBookRejectionHistoryPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AuthorBookRejectionHistorySearch =
    parseAuthorBookRejectionHistorySearch(searchParams);
  const historyQuery = useAuthorBookRejectionHistory(bookId, {
    limit: AUTHOR_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AuthorBookRejectionHistorySearch): void => {
    setSearchParams(buildRejectionHistorySearchParams(nextSearch), { replace: true });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejection history</CardTitle>
        <CardDescription>
          book_rejected audit rows for this book. There is no separate rejection table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderRejectionHistoryBody(historyQuery, listSearch, replaceSearch)}
      </CardContent>
    </Card>
  );
}

function renderRejectionHistoryBody(
  historyQuery: ReturnType<typeof useAuthorBookRejectionHistory>,
  listSearch: AuthorBookRejectionHistorySearch,
  replaceSearch: (nextSearch: AuthorBookRejectionHistorySearch) => void,
): JSX.Element {
  if (historyQuery.isPending) {
    return <AdminBookRejectionHistoryTableSkeleton />;
  }
  if (historyQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(historyQuery.error)}
        onRetry={() => {
          void historyQuery.refetch();
        }}
      />
    );
  }
  if (historyQuery.data.rejections.length === 0) {
    return (
      <EmptyState
        title="No rejections yet"
        description="GET /author/books/:id/rejection-history returned an empty list."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AuthorBookRejectionHistoryTable rejections={historyQuery.data.rejections} />
      <ListPagination
        offset={listSearch.offset}
        limit={AUTHOR_LIST_PAGE_SIZE}
        total={historyQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildRejectionHistorySearchParams(
  search: AuthorBookRejectionHistorySearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('rejectionOffset', String(search.offset));
  }
  return params;
}
