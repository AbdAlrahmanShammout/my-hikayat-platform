export type StartCheckoutServiceInput = {
  readonly userId: number;
  readonly successUrl: string;
  readonly cancelUrl: string;
};

export type StartCheckoutResult = {
  readonly url: string;
};

export type ReceiveWebhookServiceInput = {
  readonly payload: Buffer | undefined;
  readonly signature: string | undefined;
};
