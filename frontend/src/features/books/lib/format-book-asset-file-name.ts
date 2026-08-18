/**
 * Displays originalFileName from a BookAssetResponse without inventing a name.
 */
export function formatBookAssetFileName(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'Unnamed file';
  }
  return value;
}
