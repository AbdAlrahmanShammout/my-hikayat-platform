import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminAuditLogsQuery = NonNullable<
  paths['/admin/audit-logs']['get']['parameters']['query']
>;

/**
 * Lists append-only admin audit entries.
 */
export async function listAdminAuditLogs(
  query: ListAdminAuditLogsQuery = {},
): Promise<components['schemas']['GetAuditLogsResponseDto']> {
  return requestJson<components['schemas']['GetAuditLogsResponseDto']>({
    path: `/admin/audit-logs${toSearchParams(query)}`,
    method: 'GET',
  });
}
