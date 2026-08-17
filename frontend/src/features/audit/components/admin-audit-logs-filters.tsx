import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_SUBJECT_TYPES,
  type AdminAuditAction,
  type AdminAuditSubjectType,
} from '@/features/audit/lib/admin-audit-filters';
import { formatAuditEnumLabel } from '@/features/audit/lib/format-audit-enum-label';
import type { AdminAuditLogsListSearch } from '@/features/audit/lib/parse-admin-audit-logs-list-search';
import { parsePositiveInt } from '@/lib/parse-positive-int';

type AdminAuditLogsFiltersProps = {
  readonly value: AdminAuditLogsListSearch;
  readonly onChange: (nextSearch: AdminAuditLogsListSearch) => void;
};

/**
 * Query filters for GET /admin/audit-logs.
 */
export function AdminAuditLogsFilters({ value, onChange }: AdminAuditLogsFiltersProps): JSX.Element {
  const [actorUserIdDraft, setActorUserIdDraft] = useState<string>(
    value.actorUserId === undefined ? '' : String(value.actorUserId),
  );
  const [subjectIdDraft, setSubjectIdDraft] = useState<string>(
    value.subjectId === undefined ? '' : String(value.subjectId),
  );
  const [idError, setIdError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextActorUserId: number | undefined = parseSubmittedPositiveId(actorUserIdDraft);
        const nextSubjectId: number | undefined = parseSubmittedPositiveId(subjectIdDraft);
        if (actorUserIdDraft.trim() !== '' && nextActorUserId === undefined) {
          setIdError('Enter a positive actorUserId.');
          return;
        }
        if (subjectIdDraft.trim() !== '' && nextSubjectId === undefined) {
          setIdError('Enter a positive subjectId.');
          return;
        }
        setIdError(undefined);
        onChange({
          ...value,
          actorUserId: nextActorUserId,
          subjectId: nextSubjectId,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="audit-action-filter">Action</Label>
        <Select
          id="audit-action-filter"
          value={value.action ?? ''}
          onChange={(event) => {
            const nextAction: string = event.target.value;
            onChange({
              ...value,
              action: nextAction === '' ? undefined : (nextAction as AdminAuditAction),
              offset: 0,
            });
          }}
        >
          <option value="">All actions</option>
          {ADMIN_AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {formatAuditEnumLabel(action)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="audit-subject-type-filter">Subject type</Label>
        <Select
          id="audit-subject-type-filter"
          value={value.subjectType ?? ''}
          onChange={(event) => {
            const nextSubjectType: string = event.target.value;
            onChange({
              ...value,
              subjectType:
                nextSubjectType === '' ? undefined : (nextSubjectType as AdminAuditSubjectType),
              offset: 0,
            });
          }}
        >
          <option value="">All subject types</option>
          {ADMIN_AUDIT_SUBJECT_TYPES.map((subjectType) => (
            <option key={subjectType} value={subjectType}>
              {formatAuditEnumLabel(subjectType)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="audit-actor-user-id-filter">Actor user id</Label>
        <Input
          id="audit-actor-user-id-filter"
          inputMode="numeric"
          value={actorUserIdDraft}
          placeholder="All actors"
          onChange={(event) => {
            setActorUserIdDraft(event.target.value);
            setIdError(undefined);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="audit-subject-id-filter">Subject id</Label>
        <div className="flex gap-2">
          <Input
            id="audit-subject-id-filter"
            inputMode="numeric"
            value={subjectIdDraft}
            placeholder="All subjects"
            aria-invalid={idError !== undefined}
            onChange={(event) => {
              setSubjectIdDraft(event.target.value);
              setIdError(undefined);
            }}
          />
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </div>
        {idError !== undefined ? <p className="text-sm text-destructive">{idError}</p> : null}
      </div>
    </form>
  );
}

function parseSubmittedPositiveId(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }
  return parsePositiveInt(value) ?? undefined;
}
