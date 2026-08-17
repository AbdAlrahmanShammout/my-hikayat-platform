import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';
import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_SUBJECT_TYPES,
  type AdminAuditAction,
  type AdminAuditSubjectType,
} from '@/features/audit/lib/admin-audit-filters';

export type AdminAuditLogsListSearch = {
  readonly actorUserId: number | undefined;
  readonly action: AdminAuditAction | undefined;
  readonly subjectType: AdminAuditSubjectType | undefined;
  readonly subjectId: number | undefined;
  readonly offset: number;
};

/**
 * Reads audit list filters from the URL. Unknown enum values are ignored.
 */
export function parseAdminAuditLogsListSearch(
  searchParams: URLSearchParams,
): AdminAuditLogsListSearch {
  return {
    actorUserId: parsePositiveInt(searchParams.get('actorUserId') ?? undefined) ?? undefined,
    action: parseAuditAction(searchParams.get('action') ?? undefined),
    subjectType: parseAuditSubjectType(searchParams.get('subjectType') ?? undefined),
    subjectId: parsePositiveInt(searchParams.get('subjectId') ?? undefined) ?? undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseAuditAction(value: string | undefined): AdminAuditAction | undefined {
  if (value === undefined) {
    return undefined;
  }
  return ADMIN_AUDIT_ACTIONS.find((action) => action === value);
}

function parseAuditSubjectType(value: string | undefined): AdminAuditSubjectType | undefined {
  if (value === undefined) {
    return undefined;
  }
  return ADMIN_AUDIT_SUBJECT_TYPES.find((subjectType) => subjectType === value);
}
