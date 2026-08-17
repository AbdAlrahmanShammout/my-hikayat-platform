import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminAuditLogs,
  type ListAdminAuditLogsQuery,
} from '@/features/audit/api/list-admin-audit-logs';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/audit-logs.
 */
export function useAdminAuditLogsList(
  query: ListAdminAuditLogsQuery = {},
): UseQueryResult<components['schemas']['GetAuditLogsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs.list(query),
    queryFn: () => listAdminAuditLogs(query),
  });
}
