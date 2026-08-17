/**
 * Displays audit metadata as JSON. Missing metadata is not invented.
 */
export function formatAuditMetadata(value: unknown): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'Unknown metadata';
  }
}
