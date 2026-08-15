import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeConfigService } from '@/config/stripe/stripe-config.service';
import { STRIPE_CHECKOUT } from '@/providers/stripe/consts';
import {
  ConstructStripeWebhookEventInput,
  CreateStripeCheckoutSessionInput,
  CreateStripeCustomerInput,
  StripeCheckoutSession,
  StripeCustomer,
  StripeWebhookEvent,
} from '@/providers/stripe/defs/stripe-manager.defs';
import { StripeFailureException } from '@/providers/stripe/exceptions/stripe-failure.exception';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';

@Injectable()
export class StripeManagerService {
  constructor(
    private readonly stripe: Stripe,
    private readonly stripeConfigService: StripeConfigService,
  ) {}

  async createCustomer(input: CreateStripeCustomerInput): Promise<StripeCustomer> {
    try {
      const customer: Stripe.Customer = await this.stripe.customers.create({
        email: input.email,
        metadata: { clientReferenceId: input.clientReferenceId },
      });
      return { customerId: customer.id };
    } catch (err: unknown) {
      throw StripeManagerService.translateRequestError(err);
    }
  }

  async createCheckoutSession(
    input: CreateStripeCheckoutSessionInput,
  ): Promise<StripeCheckoutSession> {
    try {
      const session: Stripe.Checkout.Session = await this.stripe.checkout.sessions.create({
        mode: STRIPE_CHECKOUT.mode,
        customer: input.customerId,
        client_reference_id: input.clientReferenceId,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        line_items: [
          { price: this.stripeConfigService.priceId, quantity: STRIPE_CHECKOUT.quantity },
        ],
      });
      if (session.url === null) {
        throw new StripeFailureException();
      }
      return { checkoutSessionId: session.id, url: session.url };
    } catch (err: unknown) {
      throw StripeManagerService.translateRequestError(err);
    }
  }

  constructWebhookEvent(input: ConstructStripeWebhookEventInput): StripeWebhookEvent {
    try {
      const event: Stripe.Event = this.stripe.webhooks.constructEvent(
        input.payload,
        input.signature,
        this.stripeConfigService.webhookSecret,
      );
      return {
        id: event.id,
        type: event.type,
        objectId: StripeManagerService.readObjectId(event.data.object),
      };
    } catch (err: unknown) {
      if (err instanceof StripeInvalidWebhookException) {
        throw err;
      }
      throw new StripeInvalidWebhookException();
    }
  }

  private static readObjectId(object: unknown): string | null {
    if (typeof object === 'object' && object !== null && 'id' in object) {
      const objectId: unknown = object.id;
      if (typeof objectId === 'string' && objectId.length > 0) {
        return objectId;
      }
    }
    return null;
  }

  private static translateRequestError(err: unknown): Error {
    if (err instanceof StripeFailureException) {
      return err;
    }
    return new StripeFailureException();
  }
}
