import { hasWireInstant } from '@/lib/has-wire-instant';

const MISSING_INSTANT_LABEL = 'Not set';
const INVALID_INSTANT_LABEL = 'Unknown date';

/**
 * Formats a backend instant for display. Does not invent a timezone conversion model.
 */
export function formatWireInstant(value: unknown): string {
  if (!hasWireInstant(value)) {
    return MISSING_INSTANT_LABEL;
  }
  const parsed: Date = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return INVALID_INSTANT_LABEL;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}
