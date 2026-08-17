import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminRevenuePeriodDetailSearch } from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';
import { parsePositiveInt } from '@/lib/parse-positive-int';

type AdminPeriodOwnerFilterProps = {
  readonly value: AdminRevenuePeriodDetailSearch;
  readonly onChange: (nextSearch: AdminRevenuePeriodDetailSearch) => void;
};

/**
 * Optional ownerId filter for period earnings and analytics lists.
 */
export function AdminPeriodOwnerFilter({
  value,
  onChange,
}: AdminPeriodOwnerFilterProps): JSX.Element {
  const [ownerIdDraft, setOwnerIdDraft] = useState<string>(
    value.ownerId === undefined ? '' : String(value.ownerId),
  );
  const [ownerIdError, setOwnerIdError] = useState<string | undefined>(undefined);
  return (
    <form
      className="flex flex-col gap-2 sm:max-w-sm"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextOwnerId: number | undefined = parseSubmittedOwnerId(ownerIdDraft);
        if (ownerIdDraft.trim() !== '' && nextOwnerId === undefined) {
          setOwnerIdError('Enter a positive owner id.');
          return;
        }
        setOwnerIdError(undefined);
        onChange({
          ...value,
          ownerId: nextOwnerId,
          offset: 0,
        });
      }}
    >
      <Label htmlFor="period-owner-id-filter">ownerId</Label>
      <div className="flex gap-2">
        <Input
          id="period-owner-id-filter"
          inputMode="numeric"
          value={ownerIdDraft}
          placeholder="All owners"
          aria-invalid={ownerIdError !== undefined}
          onChange={(event) => {
            setOwnerIdDraft(event.target.value);
            setOwnerIdError(undefined);
          }}
        />
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </div>
      {ownerIdError !== undefined ? (
        <p className="text-sm text-destructive">{ownerIdError}</p>
      ) : null}
    </form>
  );
}

function parseSubmittedOwnerId(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parsePositiveInt(value) ?? undefined;
}
