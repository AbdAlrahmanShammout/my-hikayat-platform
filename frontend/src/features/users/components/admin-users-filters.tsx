import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminUsersListSearch } from '@/features/users/lib/parse-admin-users-list-search';
import { parseExactEmail } from '@/lib/parse-exact-email';

type AdminUsersFiltersProps = {
  readonly value: AdminUsersListSearch;
  readonly onChange: (nextSearch: AdminUsersListSearch) => void;
};

/**
 * Exact-email query for GET /admin/users. Audience is chosen in the sidebar.
 */
export function AdminUsersFilters({ value, onChange }: AdminUsersFiltersProps): JSX.Element {
  const [emailDraft, setEmailDraft] = useState<string>(value.email ?? '');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  return (
    <form
      className="flex max-w-xl flex-col gap-2"
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
      {emailError !== undefined ? <p className="text-sm text-destructive">{emailError}</p> : null}
    </form>
  );
}

function parseSubmittedEmail(value: string): string | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parseExactEmail(value);
}
