const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  canceled: 'Canceled',
};

/**
 * Displays the API subscription status.
 */
export function formatSubscriptionStatusLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return SUBSCRIPTION_STATUS_LABELS[value] ?? value;
}
