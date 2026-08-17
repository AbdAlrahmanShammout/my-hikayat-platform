/**
 * Formats integer cents as USD for display. Does not change the stored minor-unit value.
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
