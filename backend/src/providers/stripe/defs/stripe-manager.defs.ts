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
};
