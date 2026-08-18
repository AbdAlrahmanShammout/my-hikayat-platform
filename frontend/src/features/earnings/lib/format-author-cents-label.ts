import { formatCents } from '@/lib/format-cents';

/**
 * Displays backend integer cents. It does not recalculate pool shares.
 */
export function formatAuthorCentsLabel(cents: number): string {
  return `${formatCents(cents)} (${String(cents)} cents)`;
}
