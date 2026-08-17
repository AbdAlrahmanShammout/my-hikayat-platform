import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminUsersPanel } from '@/features/users/components/admin-users-panel';

/**
 * Admin users list. Filters and paging are query parameters on GET /admin/users.
 */
export function AdminUsersPage(): JSX.Element {
  return (
    <>
      <PageHeader title="Users" description="Change role and publisher capability." />
      <AdminUsersPanel />
    </>
  );
}
