import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  ADMIN_USER_SORT_FIELDS,
  type AdminUserSortField,
  type AdminUsersListSearch,
} from '@/features/users/lib/parse-admin-users-list-search';
import { parseExactEmail } from '@/lib/parse-exact-email';

type AdminUsersFiltersProps = {
  readonly audience: 'admins' | 'members';
  readonly value: AdminUsersListSearch;
  readonly onChange: (nextSearch: AdminUsersListSearch) => void;
};

/**
 * Apply/Clear filters for GET /admin/users. Role audience stays in the sidebar.
 */
export function AdminUsersFilters({
  audience,
  value,
  onChange,
}: AdminUsersFiltersProps): JSX.Element {
  const [emailDraft, setEmailDraft] = useState<string>(value.email ?? '');
  const [keywordDraft, setKeywordDraft] = useState<string>(value.q ?? '');
  const [publisherDraft, setPublisherDraft] = useState<string>(formatPublisher(value.isPublisher));
  const [sortByDraft, setSortByDraft] = useState<string>(value.sortBy ?? '');
  const [sortOrderDraft, setSortOrderDraft] = useState<string>(value.sortOrder ?? '');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [keywordError, setKeywordError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-3"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextEmail: string | undefined = parseSubmittedEmail(emailDraft);
        const keyword: string = keywordDraft.trim();
        if (emailDraft.trim() !== '' && nextEmail === undefined) {
          setEmailError('Enter a complete email. The API matches the exact address.');
          return;
        }
        if (keyword.length === 1) {
          setKeywordError('Enter at least 2 characters, or leave keyword empty.');
          return;
        }
        setEmailError(undefined);
        setKeywordError(undefined);
        onChange({
          email: nextEmail,
          q: keyword.length >= 2 ? keyword : undefined,
          isPublisher: parsePublisherDraft(publisherDraft),
          sortBy: toSortField(sortByDraft),
          sortOrder: sortOrderDraft === 'asc' || sortOrderDraft === 'desc' ? sortOrderDraft : undefined,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
        <p className="text-sm text-muted-foreground">
          Keyword matches email or display name. Exact email is a separate match. This list does
          not include reading access or Stripe ids.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-keyword-filter">Keyword</Label>
        <Input
          id="user-keyword-filter"
          value={keywordDraft}
          aria-invalid={keywordError !== undefined}
          onChange={(event) => {
            setKeywordDraft(event.target.value);
            setKeywordError(undefined);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-email-filter">Email (exact)</Label>
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
      </div>
      {audience === 'members' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-publisher-filter">Publisher account</Label>
          <Select
            id="user-publisher-filter"
            value={publisherDraft}
            onChange={(event) => setPublisherDraft(event.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Publisher accounts</option>
            <option value="false">Not publisher accounts</option>
          </Select>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-sort-by">Sort by</Label>
        <Select id="user-sort-by" value={sortByDraft} onChange={(event) => setSortByDraft(event.target.value)}>
          <option value="">Default</option>
          {ADMIN_USER_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-sort-order">Sort order</Label>
        <Select
          id="user-sort-order"
          value={sortOrderDraft}
          onChange={(event) => setSortOrderDraft(event.target.value)}
        >
          <option value="">Default</option>
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </Select>
      </div>
      {emailError !== undefined ? <p className="text-sm text-destructive">{emailError}</p> : null}
      {keywordError !== undefined ? <p className="text-sm text-destructive">{keywordError}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmailDraft('');
            setKeywordDraft('');
            setPublisherDraft('');
            setSortByDraft('');
            setSortOrderDraft('');
            setEmailError(undefined);
            setKeywordError(undefined);
            onChange({
              email: undefined,
              q: undefined,
              isPublisher: undefined,
              sortBy: undefined,
              sortOrder: undefined,
              offset: 0,
            });
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}

function parseSubmittedEmail(value: string): string | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parseExactEmail(value);
}

function formatPublisher(value: boolean | undefined): string {
  if (value === undefined) {
    return '';
  }
  return String(value);
}

function parsePublisherDraft(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function toSortField(value: string): AdminUserSortField | undefined {
  return ADMIN_USER_SORT_FIELDS.find((field) => field === value);
}
