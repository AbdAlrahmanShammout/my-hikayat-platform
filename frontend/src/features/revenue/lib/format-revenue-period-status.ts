const REVENUE_PERIOD_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
};

/**
 * Presents a backend revenue-period status without changing its meaning.
 */
export function formatRevenuePeriodStatus(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return REVENUE_PERIOD_STATUS_LABELS[value] ?? value;
}
