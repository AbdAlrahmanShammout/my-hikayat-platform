import { hasWireInstant } from '@/lib/has-wire-instant';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const INVALID_INSTANT_LABEL = 'Unknown date';

/**
 * Formats a backend instant as a relative time such as "2 hours ago".
 */
export function formatRelativeInstant(value: unknown, now: Date = new Date()): string {
  if (!hasWireInstant(value)) {
    return INVALID_INSTANT_LABEL;
  }
  const parsed: Date = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return INVALID_INSTANT_LABEL;
  }
  const diffMs: number = parsed.getTime() - now.getTime();
  const absMs: number = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (absMs >= MS_PER_DAY) {
    return formatter.format(Math.round(diffMs / MS_PER_DAY), 'day');
  }
  if (absMs >= MS_PER_HOUR) {
    return formatter.format(Math.round(diffMs / MS_PER_HOUR), 'hour');
  }
  if (absMs >= MS_PER_MINUTE) {
    return formatter.format(Math.round(diffMs / MS_PER_MINUTE), 'minute');
  }
  return formatter.format(Math.round(diffMs / MS_PER_SECOND), 'second');
}
