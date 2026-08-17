import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * Placeholder until the author books list STEP. Does not call GET /author/books yet.
 */
export function AuthorBooksPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Books"
        description="Your owned books will load from GET /author/books in a later STEP."
      />
      <EmptyState
        title="Books list is next"
        description="This screen does not list or create books yet. Upload, review history, and publishing stay on later STEPs."
      />
    </>
  );
}
