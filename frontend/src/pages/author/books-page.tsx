import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AUTHOR_CATEGORY_LOOKUP_LIMIT } from '@/config/author-category-lookup-limit';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { AuthorBookCreateForm } from '@/features/books/components/author-book-create-form';
import { AuthorBooksPanel } from '@/features/books/components/author-books-panel';
import { useAuthorCategoriesList } from '@/features/categories/hooks/use-author-categories-list';

/**
 * Author books list and create. List filters are query parameters on GET /author/books.
 */
export function AuthorBooksPage(): JSX.Element {
  const currentUserQuery = useCurrentUser();
  const categoriesQuery = useAuthorCategoriesList({ limit: AUTHOR_CATEGORY_LOOKUP_LIMIT });
  const isPublisher: boolean = currentUserQuery.data?.isPublisher === true;
  return (
    <>
      <PageHeader
        title="Books"
        description="Books you own, with publishing and processing status from the API."
      />
      <div className="space-y-6">
        <AuthorBookCreateForm
          isPublisher={isPublisher}
          categories={categoriesQuery.data?.categories ?? []}
          isCategoriesPending={categoriesQuery.isPending}
          categoriesError={categoriesQuery.error}
          onRetryCategories={() => {
            void categoriesQuery.refetch();
          }}
        />
        <AuthorBooksPanel />
      </div>
    </>
  );
}
