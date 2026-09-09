const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Formats a millisecond duration as a compact English label.
 */
export function formatCompactDurationMs(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '0 min';
  }
  if (value >= MS_PER_DAY) {
    return formatUnit(Math.floor(value / MS_PER_DAY), 'day', 'days');
  }
  if (value >= MS_PER_HOUR) {
    return formatUnit(Math.floor(value / MS_PER_HOUR), 'hour', 'hours');
  }
  if (value >= MS_PER_MINUTE) {
    return formatUnit(Math.floor(value / MS_PER_MINUTE), 'min', 'min');
  }
  if (value >= MS_PER_SECOND) {
    return formatUnit(Math.floor(value / MS_PER_SECOND), 'sec', 'sec');
  }
  return '0 min';
}

function formatUnit(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return `1 ${singular}`;
  }
  return `${String(count)} ${plural}`;
}
