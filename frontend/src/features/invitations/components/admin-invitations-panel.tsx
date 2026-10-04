import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import type { AdminInvitationListStatus } from '@/features/invitations/api/admin-invitation-record';
import { AdminInvitationsTable } from '@/features/invitations/components/admin-invitations-table';
import { AdminInvitationsTableSkeleton } from '@/features/invitations/components/admin-invitations-table-skeleton';
import { useAdminInvitationsList } from '@/features/invitations/hooks/use-admin-invitations-list';
import {
  buildAdminInvitationsListSearch,
  parseAdminInvitationsListSearch,
  type AdminInvitationsListSearch,
} from '@/features/invitations/lib/parse-admin-invitations-list-search';
import { parseExactEmail } from '@/lib/parse-exact-email';

const INVITATION_STATUSES = ['pending', 'expired', 'accepted', 'revoked'] as const;

/**
 * Invitation list with server-side status, email, and paging.
 */
export function AdminInvitationsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const listSearch: AdminInvitationsListSearch = parseAdminInvitationsListSearch(searchParams);
  const invitationsQuery = useAdminInvitationsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    status: listSearch.status,
    email: listSearch.email,
  });
  const replaceSearch = (nextSearch: AdminInvitationsListSearch): void => {
    setSearchParams(buildAdminInvitationsListSearch(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <InvitationFilters
        key={JSON.stringify(listSearch)}
        value={listSearch}
        onApply={(nextSearch) => replaceSearch({ ...nextSearch, offset: 0 })}
        onClear={() => replaceSearch({ status: undefined, email: undefined, offset: 0 })}
      />
      {notice !== undefined ? (
        <Alert>
          <AlertDescription role="status">{notice}</AlertDescription>
        </Alert>
      ) : null}
      {renderInvitationsBody(invitationsQuery, listSearch, replaceSearch, setNotice)}
    </div>
  );
}

function renderInvitationsBody(
  invitationsQuery: ReturnType<typeof useAdminInvitationsList>,
  listSearch: AdminInvitationsListSearch,
  replaceSearch: (nextSearch: AdminInvitationsListSearch) => void,
  onChanged: (message: string) => void,
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
        title="No invitations"
        description="Try another status or exact email. Pending is the default and excludes expired invitations."
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminInvitationsTable invitations={invitationsQuery.data.invitations} onChanged={onChanged} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={invitationsQuery.data.total}
        onOffsetChange={(offset: number) => replaceSearch({ ...listSearch, offset })}
      />
    </div>
  );
}

function InvitationFilters({
  value,
  onApply,
  onClear,
}: {
  readonly value: AdminInvitationsListSearch;
  readonly onApply: (nextSearch: AdminInvitationsListSearch) => void;
  readonly onClear: () => void;
}): JSX.Element {
  const [status, setStatus] = useState<string>(value.status ?? 'pending');
  const [email, setEmail] = useState<string>(value.email ?? '');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextEmail: string | undefined =
          email.trim() === '' ? undefined : parseExactEmail(email);
        if (email.trim() !== '' && nextEmail === undefined) {
          setEmailError('Enter a complete email. The API matches the exact address.');
          return;
        }
        setEmailError(undefined);
        onApply({
          status: isInvitationStatus(status) && status !== 'pending' ? status : undefined,
          email: nextEmail,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="invitation-status">Status</Label>
        <Select id="invitation-status" value={status} onChange={(event) => setStatus(event.target.value)}>
          {INVITATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="invitation-email">Email (exact)</Label>
        <Input
          id="invitation-email"
          type="email"
          value={email}
          aria-invalid={emailError !== undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      {emailError !== undefined ? <p className="text-sm text-destructive">{emailError}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}

function isInvitationStatus(value: string | null): value is AdminInvitationListStatus {
  return INVITATION_STATUSES.some((status) => status === value);
}
