import type { JSX } from 'react';
import { useLocation } from 'react-router';

import { PageHeader } from '@/components/layout/page-header';
import { AdminInvitationCreateDialog } from '@/features/invitations/components/admin-invitation-create-dialog';
import { AdminUsersPanel } from '@/features/users/components/admin-users-panel';

/**
 * Staff or app-member list. The sidebar chooses the audience.
 */
export function AdminUsersPage(): JSX.Element {
  const location = useLocation();
  const isAdmins: boolean = location.pathname.endsWith('/admins');
  return (
    <>
      <PageHeader
        title={isAdmins ? 'Admins' : 'Members'}
        description={
          isAdmins
            ? 'Staff accounts. Last session is the latest sign-in or session refresh.'
            : 'Readers and publishers in the app, with the plan each account is on.'
        }
        actions={isAdmins ? <AdminInvitationCreateDialog /> : undefined}
      />
      <AdminUsersPanel audience={isAdmins ? 'admins' : 'members'} />
    </>
  );
}
