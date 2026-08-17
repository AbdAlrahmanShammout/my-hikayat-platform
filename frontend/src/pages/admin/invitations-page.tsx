import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminInvitationsPanel } from '@/features/invitations/components/admin-invitations-panel';

/**
 * Admin invitation list. Create sends the official email and returns the token once.
 */
export function AdminInvitationsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Invitations"
        description="Invite an admin by email. Pending invitations expire after seven days."
      />
      <AdminInvitationsPanel />
    </>
  );
}
