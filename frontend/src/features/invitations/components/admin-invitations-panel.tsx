import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminInvitationCreateForm } from '@/features/invitations/components/admin-invitation-create-form';
import { AdminInvitationsTable } from '@/features/invitations/components/admin-invitations-table';
import { AdminInvitationsTableSkeleton } from '@/features/invitations/components/admin-invitations-table-skeleton';
import { useAdminInvitationsList } from '@/features/invitations/hooks/use-admin-invitations-list';
import {
  parseAdminInvitationsListSearch,
  type AdminInvitationsListSearch,
} from '@/features/invitations/lib/parse-admin-invitations-list-search';

/**
 * Invitation list with create form and server-side paging.
 */
export function AdminInvitationsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminInvitationsListSearch = parseAdminInvitationsListSearch(searchParams);
  const invitationsQuery = useAdminInvitationsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
  });
  const replaceSearch = (nextSearch: AdminInvitationsListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <AdminInvitationCreateForm />
      {renderInvitationsPanelBody(invitationsQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderInvitationsPanelBody(
  invitationsQuery: ReturnType<typeof useAdminInvitationsList>,
  listSearch: AdminInvitationsListSearch,
  replaceSearch: (nextSearch: AdminInvitationsListSearch) => void,
): JSX.Element {
  if (invitationsQuery.isPending) {
    return <AdminInvitationsTableSkeleton />;
  }
  if (invitationsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(invitationsQuery.error)}
        onRetry={() => {
          void invitationsQuery.refetch();
        }}
      />
    );
  }
  if (invitationsQuery.data.invitations.length === 0) {
    return (
      <EmptyState
        title="No pending invitations"
        description="GET /admin/invitations returned no pending unexpired invitations."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminInvitationsTable invitations={invitationsQuery.data.invitations} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={invitationsQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ offset });
        }}
      />
    </div>
  );
}

function buildListSearchParams(search: AdminInvitationsListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
