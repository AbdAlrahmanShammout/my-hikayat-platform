import type { AdminAuditSubjectType } from '@/features/audit/lib/admin-audit-filters';

const SUBJECT_PATHS: Record<AdminAuditSubjectType, (subjectId: number) => string> = {
  book: (subjectId) => `/admin/books/${subjectId}`,
  user: (subjectId) => `/admin/users/${subjectId}`,
  subscription: (subjectId) => `/admin/subscriptions/${subjectId}`,
  collection: (subjectId) => `/admin/collections/${subjectId}`,
  revenue_period: (subjectId) => `/admin/revenue/${subjectId}`,
};

/**
 * Resolves the admin screen for an audit subject. Unknown types have no path.
 */
export function getAdminAuditSubjectPath(
  subjectType: string,
  subjectId: number,
): string | null {
  if (!isAdminAuditSubjectType(subjectType)) {
    return null;
  }
  return SUBJECT_PATHS[subjectType](subjectId);
}

function isAdminAuditSubjectType(value: string): value is AdminAuditSubjectType {
  return Object.hasOwn(SUBJECT_PATHS, value);
}
