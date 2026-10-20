import { sumSubscriptionNetCents } from '@/providers/stripe/sum-subscription-net-cents.helper';

describe('sumSubscriptionNetCents', () => {
  it('subtracts the Stripe fee and collected tax from an unrefunded charge', () => {
    const actualNet = sumSubscriptionNetCents({
      charges: [{ amountCents: 10000, amountRefundedCents: 0, feeCents: 300 }],
      invoiceTaxes: [{ amountPaidCents: 10000, creditNoteCents: 0, taxCents: 200 }],
    });
    expect(actualNet).toBe(9500);
  });

  it('drops a fully refunded charge and its tax', () => {
    const actualNet = sumSubscriptionNetCents({
      charges: [{ amountCents: 10000, amountRefundedCents: 10000, feeCents: 300 }],
      invoiceTaxes: [{ amountPaidCents: 10000, creditNoteCents: 10000, taxCents: 200 }],
    });
    expect(actualNet).toBe(0);
  });

  it('keeps a proportional fee and tax on a partial refund', () => {
    const actualNet = sumSubscriptionNetCents({
      charges: [{ amountCents: 10000, amountRefundedCents: 5000, feeCents: 300 }],
      invoiceTaxes: [{ amountPaidCents: 10000, creditNoteCents: 5000, taxCents: 200 }],
    });
    expect(actualNet).toBe(4750);
  });
});
