/**
 * Displays a rejection reason from the API. Missing values are not invented.
 */
export function formatBookRejectionReason(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'Not set';
  }
  return value;
}
