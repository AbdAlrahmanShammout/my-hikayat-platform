const READING_ACCESS_LABELS: Record<string, string> = {
  free: 'Free',
  trial: 'Trial',
  paid: 'Paid',
};

/**
 * Displays the API readingAccessState without recomputing entitlement.
 */
export function formatReadingAccessState(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return READING_ACCESS_LABELS[value] ?? value;
}
