const SUBSCRIPTION_ENUM_LABELS: Record<string, string> = {
  active: 'Active',
  canceled: 'Canceled',
  free: 'Free',
  monthly_paid: 'Monthly paid',
  month: 'Month',
};

/**
 * Presents a backend subscription or plan enum without changing its meaning.
 */
export function formatSubscriptionEnumLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return SUBSCRIPTION_ENUM_LABELS[value] ?? value;
}
