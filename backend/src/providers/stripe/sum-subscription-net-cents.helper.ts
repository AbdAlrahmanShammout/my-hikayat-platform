export type SubscriptionChargeNetInput = {
  readonly amountCents: number;
  readonly amountRefundedCents: number;
  readonly feeCents: number;
};

export type SubscriptionInvoiceTaxInput = {
  readonly amountPaidCents: number;
  readonly creditNoteCents: number;
  readonly taxCents: number;
};

/**
 * Net subscription cash for one month.
 * Charge amounts keep the unrefunded principal and a proportional Stripe fee.
 * Collected tax is removed in the same proportion as the unrefunded invoice.
 * Chargebacks stay out of this figure.
 */
export function sumSubscriptionNetCents(input: {
  readonly charges: readonly SubscriptionChargeNetInput[];
  readonly invoiceTaxes: readonly SubscriptionInvoiceTaxInput[];
}): number {
  const chargeNetCents: number = input.charges.reduce(addChargeNet, 0);
  const taxCents: number = input.invoiceTaxes.reduce(addRetainedTax, 0);
  return Math.max(0, chargeNetCents - taxCents);
}

function addChargeNet(sum: number, charge: SubscriptionChargeNetInput): number {
  if (charge.amountCents <= 0) {
    return sum;
  }
  const retainedCents: number = Math.max(0, charge.amountCents - charge.amountRefundedCents);
  const retainedFeeCents: number = Math.round((charge.feeCents * retainedCents) / charge.amountCents);
  return sum + retainedCents - retainedFeeCents;
}

function addRetainedTax(sum: number, invoice: SubscriptionInvoiceTaxInput): number {
  if (invoice.amountPaidCents <= 0 || invoice.taxCents <= 0) {
    return sum;
  }
  const retainedCents: number = Math.max(0, invoice.amountPaidCents - invoice.creditNoteCents);
  const retainedTaxCents: number = Math.round(
    (invoice.taxCents * retainedCents) / invoice.amountPaidCents,
  );
  return sum + retainedTaxCents;
}
