import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one audit log entry.
 */
export async function getAdminAuditLog(
  auditLogId: number,
): Promise<components['schemas']['AuditLogResponse']> {
  return requestJson<components['schemas']['AuditLogResponse']>({
    path: `/admin/audit-logs/${auditLogId}`,
    method: 'GET',
  });
}
