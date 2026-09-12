/**
 * Formats a catalog plan amount for kids-friendly display. Interval comes from the API.
 */
export function formatPlanPriceLabel(
  amountCents: number | null | undefined,
  currency: string | null | undefined,
  interval?: 'month' | 'year' | null,
): string {
  if (amountCents === null || amountCents === undefined || currency === null || currency === undefined) {
    return '';
  }
  const amount: number = amountCents / 100;
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    formatted = `${amount.toFixed(2)} ${currency}`;
  }
  if (interval === 'year') {
    return `${formatted} / year`;
  }
  if (interval === 'month') {
    return `${formatted} / month`;
  }
  return formatted;
}
