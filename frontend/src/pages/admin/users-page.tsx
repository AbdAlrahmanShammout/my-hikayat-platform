import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/layout/page-header';

/**
 * User management placeholder until STEP 4.
 */
export function AdminUsersPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Users" description="Change role and publisher capability." />
      <EmptyState
        title="User management is not available yet"
        description="STEP 4 will list users from GET /admin/users. An admin cannot change their own account here, and the last admin cannot be demoted."
      />
    </>
  );
}
