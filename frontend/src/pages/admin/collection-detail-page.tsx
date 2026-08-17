import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { ADMIN_COLLECTION_BOOK_LOOKUP_LIMIT } from '@/config/admin-collection-book-lookup-limit';
import { useAdminBooksList } from '@/features/books/hooks/use-admin-books-list';
import { AdminCollectionActions } from '@/features/collections/components/admin-collection-actions';
import { AdminCollectionMembership } from '@/features/collections/components/admin-collection-membership';
import { AdminCollectionTitleForm } from '@/features/collections/components/admin-collection-title-form';
import { useAdminCollection } from '@/features/collections/hooks/use-admin-collection';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Admin collection detail: title, membership, and soft-delete.
 */
export function AdminCollectionDetailPage(): JSX.Element {
  const { collectionId: collectionIdParam } = useParams();
  const collectionId: number | null = parsePositiveInt(collectionIdParam);
  if (collectionId === null) {
    return (
      <>
        <PageHeader title="Collection" description="Curate membership and order." />
        <ErrorState
          title="Invalid collection id"
          message="The collection id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminCollectionDetailContent collectionId={collectionId} />;
}

function AdminCollectionDetailContent({
  collectionId,
}: {
  readonly collectionId: number;
}): JSX.Element {
  const collectionQuery = useAdminCollection(collectionId);
  const booksQuery = useAdminBooksList({ limit: ADMIN_COLLECTION_BOOK_LOOKUP_LIMIT });
  if (collectionQuery.isPending) {
    return (
      <>
        <PageHeader title="Collection" description="Curate membership and order." />
        <PageSkeleton />
      </>
    );
  }
  if (collectionQuery.isError) {
    return (
      <>
        <PageHeader
          title="Collection"
          description="Curate membership and order."
          actions={backToCollectionsAction()}
        />
        <ErrorState
          message={getCollectionLoadMessage(collectionQuery.error)}
          onRetry={() => {
            void collectionQuery.refetch();
          }}
        />
      </>
    );
  }
  const collection = collectionQuery.data;
  return (
    <>
      <PageHeader
        title={collection.title}
        description="Unpublished books remain visible in admin membership."
        actions={backToCollectionsAction()}
      />
      <div className="space-y-6">
        <AdminCollectionActions collection={collection} />
        <AdminCollectionTitleForm
          key={`${collection.id}-${collection.updatedAt}`}
          collection={collection}
        />
        <AdminCollectionMembership
          collection={collection}
          books={booksQuery.data?.books ?? []}
        />
      </div>
    </>
  );
}

function backToCollectionsAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/collections">Back to collections</Link>
    </Button>
  );
}

function getCollectionLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This collection was not found. It may have been deleted.';
  }
  return getUserFacingErrorMessage(error);
}
