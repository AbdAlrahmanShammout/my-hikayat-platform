import { parseWireCents } from '@/features/revenue/lib/parse-wire-cents';
import { formatCents } from '@/lib/format-cents';

const UNSET_POOL_LABEL = 'Not set';

/**
 * Displays the admin-set pool. Shows both USD and the integer cents from the API.
 */
export function formatPoolAmountLabel(value: unknown): string {
  const cents: number | null = parseWireCents(value);
  if (cents === null) {
    return UNSET_POOL_LABEL;
  }
  return `${formatCents(cents)} (${String(cents)} cents)`;
}
