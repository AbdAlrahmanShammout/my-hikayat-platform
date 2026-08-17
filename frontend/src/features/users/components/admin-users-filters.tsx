import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatUserRoleLabel } from '@/features/users/lib/format-user-role-label';
import type { AdminUsersListSearch } from '@/features/users/lib/parse-admin-users-list-search';
import { parseExactEmail } from '@/lib/parse-exact-email';
import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

type AdminUsersFiltersProps = {
  readonly value: AdminUsersListSearch;
  readonly onChange: (nextSearch: AdminUsersListSearch) => void;
};

/**
 * Query filters for GET /admin/users. Email is an exact match.
 */
export function AdminUsersFilters({ value, onChange }: AdminUsersFiltersProps): JSX.Element {
  const [emailDraft, setEmailDraft] = useState<string>(value.email ?? '');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextEmail: string | undefined = parseSubmittedEmail(emailDraft);
        if (emailDraft.trim() !== '' && nextEmail === undefined) {
          setEmailError('Enter a complete email. The API matches the exact address.');
          return;
        }
        setEmailError(undefined);
        onChange({
          ...value,
          email: nextEmail,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-role-filter">Role</Label>
        <Select
          id="user-role-filter"
          value={value.role ?? ''}
          onChange={(event) => {
            const nextRole: string = event.target.value;
            onChange({
              ...value,
              role: nextRole === '' ? undefined : (nextRole as UserRole),
              offset: 0,
            });
          }}
        >
          <option value="">All roles</option>
          <option value={USER_ROLES.READER}>{formatUserRoleLabel(USER_ROLES.READER)}</option>
          <option value={USER_ROLES.AUTHOR}>{formatUserRoleLabel(USER_ROLES.AUTHOR)}</option>
          <option value={USER_ROLES.ADMIN}>{formatUserRoleLabel(USER_ROLES.ADMIN)}</option>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-publisher-filter">Publisher</Label>
        <Select
          id="user-publisher-filter"
          value={serializePublisherFilter(value.isPublisher)}
          onChange={(event) => {
            onChange({
              ...value,
              isPublisher: parsePublisherFilter(event.target.value),
              offset: 0,
            });
          }}
        >
          <option value="">All</option>
          <option value="true">Publisher</option>
          <option value="false">Not publisher</option>
        </Select>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-2">
        <Label htmlFor="user-email-filter">Email (exact)</Label>
        <div className="flex gap-2">
          <Input
            id="user-email-filter"
            type="email"
            value={emailDraft}
            placeholder="reader@example.com"
            aria-invalid={emailError !== undefined}
            onChange={(event) => {
              setEmailDraft(event.target.value);
              setEmailError(undefined);
            }}
          />
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </div>
        {emailError !== undefined ? (
          <p className="text-sm text-destructive">{emailError}</p>
        ) : null}
      </div>
    </form>
  );
}

function serializePublisherFilter(value: boolean | undefined): string {
  if (value === undefined) {
    return '';
  }
  return value ? 'true' : 'false';
}

function parsePublisherFilter(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function parseSubmittedEmail(value: string): string | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parseExactEmail(value);
}
