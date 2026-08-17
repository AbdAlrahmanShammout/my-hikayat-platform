import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AuthorSessionSummary } from '@/features/auth/components/author-session-summary';

/**
 * Author home. Identity comes from GET /auth/me, not invented analytics.
 */
export function AuthorHomePage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Overview"
        description="This is the author workspace. Book management is a later screen."
      />
      <AuthorSessionSummary />
    </>
  );
}
