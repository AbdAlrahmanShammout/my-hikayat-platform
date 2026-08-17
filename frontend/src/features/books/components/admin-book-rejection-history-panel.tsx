import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminBookRejectionHistoryTable } from '@/features/books/components/admin-book-rejection-history-table';
import { AdminBookRejectionHistoryTableSkeleton } from '@/features/books/components/admin-book-rejection-history-table-skeleton';
import { useAdminBookRejectionHistory } from '@/features/books/hooks/use-admin-book-rejection-history';
import {
  parseAdminBookRejectionHistorySearch,
  type AdminBookRejectionHistorySearch,
} from '@/features/books/lib/parse-admin-book-rejection-history-search';

type AdminBookRejectionHistoryPanelProps = {
  readonly bookId: number;
};

/**
 * GET /admin/books/:id/rejection-history. Empty when the book has never been rejected.
 */
export function AdminBookRejectionHistoryPanel({
  bookId,
}: AdminBookRejectionHistoryPanelProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminBookRejectionHistorySearch =
    parseAdminBookRejectionHistorySearch(searchParams);
  const historyQuery = useAdminBookRejectionHistory(bookId, {
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminBookRejectionHistorySearch): void => {
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
  historyQuery: ReturnType<typeof useAdminBookRejectionHistory>,
  listSearch: AdminBookRejectionHistorySearch,
  replaceSearch: (nextSearch: AdminBookRejectionHistorySearch) => void,
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
        description="GET /admin/books/:id/rejection-history returned an empty list."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminBookRejectionHistoryTable rejections={historyQuery.data.rejections} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={historyQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildRejectionHistorySearchParams(
  search: AdminBookRejectionHistorySearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('rejectionOffset', String(search.offset));
  }
  return params;
}
