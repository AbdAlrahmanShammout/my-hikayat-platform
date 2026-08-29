/**
 * Formats Stripe amount cents for admin display.
 */
export function formatPlanAmountLabel(
  amountCents: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amountCents === null || amountCents === undefined || currency === null || currency === undefined) {
    return '—';
  }
  const amount: number = amountCents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
