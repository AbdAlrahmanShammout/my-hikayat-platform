import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminAuditLog } from '@/features/audit/api/get-admin-audit-log';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/audit-logs/:id.
 */
export function useAdminAuditLog(
  auditLogId: number,
): UseQueryResult<components['schemas']['AuditLogResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs.detail(auditLogId),
    queryFn: () => getAdminAuditLog(auditLogId),
  });
}
