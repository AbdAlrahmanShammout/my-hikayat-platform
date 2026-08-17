import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { ADMIN_CATEGORY_LOOKUP_LIMIT } from '@/config/admin-category-lookup-limit';
import { AdminBookActions } from '@/features/books/components/admin-book-actions';
import { AdminBookDetailSummary } from '@/features/books/components/admin-book-detail-summary';
import { AdminBookEditForm } from '@/features/books/components/admin-book-edit-form';
import { useAdminBook } from '@/features/books/hooks/use-admin-book';
import { useAdminCategoriesList } from '@/features/categories/hooks/use-admin-categories-list';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Admin book detail: metadata edit and review actions.
 */
export function AdminBookDetailPage(): JSX.Element {
  const { bookId: bookIdParam } = useParams();
  const bookId: number | null = parsePositiveInt(bookIdParam);
  if (bookId === null) {
    return (
      <>
        <PageHeader title="Book" description="Catalog review and metadata." />
        <ErrorState
          title="Invalid book id"
          message="The book id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminBookDetailContent bookId={bookId} />;
}

function AdminBookDetailContent({ bookId }: { readonly bookId: number }): JSX.Element {
  const bookQuery = useAdminBook(bookId);
  const categoriesQuery = useAdminCategoriesList({ limit: ADMIN_CATEGORY_LOOKUP_LIMIT });
  if (bookQuery.isPending) {
    return (
      <>
        <PageHeader title="Book" description="Catalog review and metadata." />
        <PageSkeleton />
      </>
    );
  }
  if (bookQuery.isError) {
    return (
      <>
        <PageHeader
          title="Book"
          description="Catalog review and metadata."
          actions={backToBooksAction()}
        />
        <ErrorState
          message={getBookLoadMessage(bookQuery.error)}
          onRetry={() => {
            void bookQuery.refetch();
          }}
        />
      </>
    );
  }
  const book = bookQuery.data;
  return (
    <>
      <PageHeader
        title={book.title}
        description="Review publishing status, metadata, and catalog visibility."
        actions={backToBooksAction()}
      />
      <div className="space-y-6">
        <AdminBookActions book={book} />
        <AdminBookDetailSummary book={book} />
        <AdminBookEditForm
          key={`${book.id}-${book.updatedAt}`}
          book={book}
          categories={categoriesQuery.data?.categories ?? []}
          isCategoriesPending={categoriesQuery.isPending}
        />
      </div>
    </>
  );
}

function backToBooksAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/books">Back to books</Link>
    </Button>
  );
}

function getBookLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This book was not found. It may have been deleted.';
  }
  return getUserFacingErrorMessage(error);
}
