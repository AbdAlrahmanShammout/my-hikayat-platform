/**
 * Displays an optional audit reason. Missing values are not invented.
 */
export function formatAuditReason(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'Not set';
  }
  return value;
}
