export type CreateStripeCustomerInput = {
  readonly email: string;
  readonly clientReferenceId: string;
};

export type StripeCustomer = {
  readonly customerId: string;
};

export type CreateStripeCheckoutSessionInput = {
  readonly customerId: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly clientReferenceId: string;
};

export type StripeCheckoutSession = {
  readonly checkoutSessionId: string;
  readonly url: string;
};

export type ConstructStripeWebhookEventInput = {
  readonly payload: string | Buffer;
  readonly signature: string;
};

export type StripeWebhookEvent = {
  readonly id: string;
  readonly type: string;
  readonly objectId: string | null;
  readonly customerId: string | null;
  readonly subscriptionId: string | null;
  readonly clientReferenceId: string | null;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
  readonly status: string | null;
};

export type HandleCheckoutCompletedInput = {
  readonly customerId: string;
  readonly subscriptionId: string;
  readonly clientReferenceId: string;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
};

export type HandleSubscriptionRenewedInput = {
  readonly customerId: string | null;
  readonly subscriptionId: string;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
  readonly status: string | null;
};

export type HandleSubscriptionCanceledInput = {
  readonly customerId: string | null;
  readonly subscriptionId: string;
  readonly currentPeriodEnd: Date | null;
};

export type MapStripeWebhookEventInput = {
  readonly id: string;
  readonly type: string;
  readonly object: unknown;
};

export type RefundPaidSubscriptionInput = {
  readonly stripeSubscriptionId: string;
};

export type StripeRefund = {
  readonly refundId: string;
};
