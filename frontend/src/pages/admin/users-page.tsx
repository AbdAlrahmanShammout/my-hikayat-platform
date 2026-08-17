import type { JSX } from 'react';
import { Link } from 'react-router';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { AdminUsersPanel } from '@/features/users/components/admin-users-panel';

/**
 * Admin users list. Filters and paging are query parameters on GET /admin/users.
 */
export function AdminUsersPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Users"
        description="Change role and publisher capability. Granting admin requires an invitation."
        actions={
          <Button asChild>
            <Link to="/admin/invitations">Invite admin</Link>
          </Button>
        }
      />
      <AdminUsersPanel />
    </>
  );
}
