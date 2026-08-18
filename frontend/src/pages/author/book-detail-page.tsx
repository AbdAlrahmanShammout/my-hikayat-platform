import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { AUTHOR_CATEGORY_LOOKUP_LIMIT } from '@/config/author-category-lookup-limit';
import { AuthorBookDetailSummary } from '@/features/books/components/author-book-detail-summary';
import { AuthorBookEditForm } from '@/features/books/components/author-book-edit-form';
import { AuthorBookPreviewImageUploadForm } from '@/features/books/components/author-book-preview-image-upload-form';
import { AuthorBookPromoVideoUploadForm } from '@/features/books/components/author-book-promo-video-upload-form';
import { AuthorBookRejectionHistoryPanel } from '@/features/books/components/author-book-rejection-history-panel';
import { AuthorBookSourceUploadForm } from '@/features/books/components/author-book-source-upload-form';
import { AuthorBookSubmitForReviewActions } from '@/features/books/components/author-book-submit-for-review-actions';
import { useAuthorBook } from '@/features/books/hooks/use-author-book';
import { useAuthorCategoriesList } from '@/features/categories/hooks/use-author-categories-list';
import type { components } from '@/generated/author';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Author book detail: metadata, categories, media, submit for review, and rejection history.
 */
export function AuthorBookDetailPage(): JSX.Element {
  const { bookId: bookIdParam } = useParams();
  const bookId: number | null = parsePositiveInt(bookIdParam);
  if (bookId === null) {
    return (
      <>
        <PageHeader title="Book" description="Owned-book metadata." />
        <ErrorState
          title="Invalid book id"
          message="The book id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AuthorBookDetailContent bookId={bookId} />;
}

function AuthorBookDetailContent({ bookId }: { readonly bookId: number }): JSX.Element {
  const bookQuery = useAuthorBook(bookId);
  const categoriesQuery = useAuthorCategoriesList({ limit: AUTHOR_CATEGORY_LOOKUP_LIMIT });
  if (bookQuery.isPending) {
    return (
      <>
        <PageHeader title="Book" description="Owned-book metadata." />
        <PageSkeleton />
      </>
    );
  }
  if (bookQuery.isError) {
    return (
      <>
        <PageHeader title="Book" description="Owned-book metadata." actions={backToBooksAction()} />
        <ErrorState
          message={getBookLoadMessage(bookQuery.error)}
          onRetry={() => {
            void bookQuery.refetch();
          }}
        />
      </>
    );
  }
  const book: components['schemas']['BookResponse'] = bookQuery.data;
  return (
    <>
      <PageHeader
        title={book.title}
        description="Publishing status is displayed from the API and is not edited here."
        actions={backToBooksAction()}
      />
      <div className="space-y-6">
        <AuthorBookDetailSummary book={book} />
        <AuthorBookSubmitForReviewActions book={book} />
        <AuthorBookRejectionHistoryPanel bookId={book.id} />
        <AuthorBookSourceUploadForm bookId={book.id} />
        <AuthorBookPreviewImageUploadForm bookId={book.id} />
        <AuthorBookPromoVideoUploadForm bookId={book.id} />
        <AuthorBookEditForm
          key={`${book.id}-${book.updatedAt}`}
          book={book}
          categories={categoriesQuery.data?.categories ?? []}
          isCategoriesPending={categoriesQuery.isPending}
          categoriesError={categoriesQuery.error}
          onRetryCategories={() => {
            void categoriesQuery.refetch();
          }}
        />
      </div>
    </>
  );
}

function backToBooksAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/author/books">Back to books</Link>
    </Button>
  );
}

function getBookLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This book was not found. You may not own it, or it may have been deleted.';
  }
  return getUserFacingErrorMessage(error);
}
