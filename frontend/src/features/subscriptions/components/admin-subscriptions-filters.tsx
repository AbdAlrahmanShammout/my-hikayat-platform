import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatSubscriptionEnumLabel } from '@/features/subscriptions/lib/format-subscription-enum-label';
import type { AdminSubscriptionsListSearch } from '@/features/subscriptions/lib/parse-admin-subscriptions-list-search';
import {
  SUBSCRIPTION_STATUS_FILTERS,
  type SubscriptionStatusFilter,
} from '@/features/subscriptions/lib/subscription-status-filters';
import { parsePositiveInt } from '@/lib/parse-positive-int';

type AdminSubscriptionsFiltersProps = {
  readonly value: AdminSubscriptionsListSearch;
  readonly onChange: (nextSearch: AdminSubscriptionsListSearch) => void;
};

/**
 * Query filters for GET /admin/subscriptions.
 */
export function AdminSubscriptionsFilters({
  value,
  onChange,
}: AdminSubscriptionsFiltersProps): JSX.Element {
  const [userIdDraft, setUserIdDraft] = useState<string>(
    value.userId === undefined ? '' : String(value.userId),
  );
  const [userIdError, setUserIdError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextUserId: number | undefined = parseSubmittedUserId(userIdDraft);
        if (userIdDraft.trim() !== '' && nextUserId === undefined) {
          setUserIdError('Enter a positive user id.');
          return;
        }
        setUserIdError(undefined);
        onChange({
          ...value,
          userId: nextUserId,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="subscription-status-filter">Status</Label>
        <Select
          id="subscription-status-filter"
          value={value.status ?? ''}
          onChange={(event) => {
            const nextStatus: string = event.target.value;
            onChange({
              ...value,
              status: nextStatus === '' ? undefined : (nextStatus as SubscriptionStatusFilter),
              offset: 0,
            });
          }}
        >
          <option value="">All statuses</option>
          {SUBSCRIPTION_STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {formatSubscriptionEnumLabel(status)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-2">
        <Label htmlFor="subscription-user-id-filter">User id</Label>
        <div className="flex gap-2">
          <Input
            id="subscription-user-id-filter"
            inputMode="numeric"
            value={userIdDraft}
            placeholder="5"
            aria-invalid={userIdError !== undefined}
            onChange={(event) => {
              setUserIdDraft(event.target.value);
              setUserIdError(undefined);
            }}
          />
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </div>
        {userIdError !== undefined ? (
          <p className="text-sm text-destructive">{userIdError}</p>
        ) : null}
      </div>
    </form>
  );
}

function parseSubmittedUserId(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parsePositiveInt(value) ?? undefined;
}
