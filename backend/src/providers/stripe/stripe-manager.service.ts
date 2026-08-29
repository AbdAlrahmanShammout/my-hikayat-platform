import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeConfigService } from '@/config/stripe/stripe-config.service';
import { STRIPE } from '@/providers/stripe/consts';
import {
  ConstructStripeWebhookEventInput,
  CreateStripeCheckoutSessionInput,
  CreateStripeCustomerInput,
  RefundPaidSubscriptionInput,
  CancelPaidSubscriptionInput,
  RetrieveStripePriceInput,
  StripeCheckoutSession,
  StripeCustomer,
  StripePrice,
  StripeRefund,
  StripeWebhookEvent,
} from '@/providers/stripe/defs/stripe-manager.defs';
import { dispatchStripeWebhookEvent } from '@/providers/stripe/dispatch-stripe-webhook-event.helper';
import { StripeFailureException } from '@/providers/stripe/exceptions/stripe-failure.exception';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeNotInitializedException } from '@/providers/stripe/exceptions/stripe-not-initialized.exception';
import { StripeEventHandlers } from '@/providers/stripe/interfaces/stripe-event-handlers.interface';
import { mapStripeWebhookEvent } from '@/providers/stripe/map-stripe-webhook-event.helper';

@Injectable()
export class StripeManagerService {
  private readonly logger = new Logger(StripeManagerService.name);
  private eventHandlers: StripeEventHandlers | null = null;

  constructor(
    private readonly stripe: Stripe,
    private readonly stripeConfigService: StripeConfigService,
  ) {}

  initialize(eventHandlers: StripeEventHandlers): Promise<void> {
    this.eventHandlers = eventHandlers;
    return Promise.resolve();
  }

  async createCustomer(input: CreateStripeCustomerInput): Promise<StripeCustomer> {
    try {
      const customer: Stripe.Customer = await this.stripe.customers.create({
        email: input.email,
        metadata: { clientReferenceId: input.clientReferenceId },
      });
      return { customerId: customer.id };
    } catch (err: unknown) {
      throw this.translateRequestError(err);
    }
  }

  async createCheckoutSession(
    input: CreateStripeCheckoutSessionInput,
  ): Promise<StripeCheckoutSession> {
    try {
      const session: Stripe.Checkout.Session = await this.stripe.checkout.sessions.create({
        mode: STRIPE.checkout.mode,
        customer: input.customerId,
        client_reference_id: input.clientReferenceId,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        line_items: [{ price: input.priceId, quantity: STRIPE.checkout.quantity }],
        metadata: { planId: input.metadata.planId },
        subscription_data: {
          metadata: { planId: input.metadata.planId },
        },
      });
      if (session.url === null) {
        throw new StripeFailureException();
      }
      return { checkoutSessionId: session.id, url: session.url };
    } catch (err: unknown) {
      throw this.translateRequestError(err);
    }
  }

  async retrievePrice(input: RetrieveStripePriceInput): Promise<StripePrice> {
    try {
      const price: Stripe.Price = await this.stripe.prices.retrieve(input.priceId);
      return StripeManagerService.mapStripePrice(price);
    } catch (err: unknown) {
      throw this.translateRequestError(err);
    }
  }

  constructWebhookEvent(input: ConstructStripeWebhookEventInput): StripeWebhookEvent {
    try {
      const event: Stripe.Event = this.stripe.webhooks.constructEvent(
        input.payload,
        input.signature,
        this.stripeConfigService.webhookSecret,
      );
      return mapStripeWebhookEvent({
        id: event.id,
        type: event.type,
        object: event.data.object,
      });
    } catch (err: unknown) {
      if (err instanceof StripeInvalidWebhookException) {
        throw err;
      }
      throw new StripeInvalidWebhookException();
    }
  }

  async processWebhook(input: ConstructStripeWebhookEventInput): Promise<void> {
    if (this.eventHandlers === null) {
      throw new StripeNotInitializedException();
    }
    const event: StripeWebhookEvent = await this.enrichCheckoutPeriods(
      this.constructWebhookEvent(input),
    );
    await dispatchStripeWebhookEvent({ event, eventHandlers: this.eventHandlers });
  }

  async refundPaidSubscription(input: RefundPaidSubscriptionInput): Promise<StripeRefund> {
    try {
      const paymentIntentId: string = await this.readLatestPaidPaymentIntentId(
        input.stripeSubscriptionId,
      );
      const refund = await this.stripe.refunds.create({ payment_intent: paymentIntentId });
      await this.stripe.subscriptions.cancel(input.stripeSubscriptionId);
      return { refundId: refund.id };
    } catch (err: unknown) {
      throw this.translateRequestError(err);
    }
  }

  async cancelPaidSubscription(input: CancelPaidSubscriptionInput): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(input.stripeSubscriptionId);
    } catch (err: unknown) {
      throw this.translateRequestError(err);
    }
  }

  private async enrichCheckoutPeriods(event: StripeWebhookEvent): Promise<StripeWebhookEvent> {
    if (event.type !== STRIPE.webhookEventType.checkoutSessionCompleted) {
      return event;
    }
    if (event.currentPeriodStart !== null && event.currentPeriodEnd !== null) {
      return event;
    }
    if (event.subscriptionId === null) {
      return event;
    }
    try {
      const subscription: Stripe.Subscription = await this.stripe.subscriptions.retrieve(
        event.subscriptionId,
      );
      const mapped: StripeWebhookEvent = mapStripeWebhookEvent({
        id: event.id,
        type: event.type,
        object: subscription,
      });
      return {
        ...event,
        customerId: event.customerId ?? mapped.customerId,
        planId: event.planId ?? mapped.planId,
        currentPeriodStart: event.currentPeriodStart ?? mapped.currentPeriodStart,
        currentPeriodEnd: event.currentPeriodEnd ?? mapped.currentPeriodEnd,
        status: event.status ?? mapped.status,
      };
    } catch {
      return event;
    }
  }

  private async readLatestPaidPaymentIntentId(stripeSubscriptionId: string): Promise<string> {
    const invoices = await this.stripe.invoices.list({
      subscription: stripeSubscriptionId,
      status: 'paid',
      limit: 1,
    });
    const paymentIntentId: string | null = StripeManagerService.readPaymentIntentId(
      invoices.data[0],
    );
    if (paymentIntentId === null) {
      throw new StripeFailureException();
    }
    return paymentIntentId;
  }

  private static mapStripePrice(price: Stripe.Price): StripePrice {
    if (price.unit_amount === null) {
      throw new StripeFailureException('Stripe price is missing a unit amount');
    }
    if (price.type !== 'recurring' || price.recurring === null) {
      throw new StripeFailureException('Stripe price must be recurring');
    }
    const interval: string = price.recurring.interval;
    if (interval !== 'month' && interval !== 'year') {
      throw new StripeFailureException('Stripe price interval must be month or year');
    }
    return {
      priceId: price.id,
      amountCents: price.unit_amount,
      currency: price.currency,
      interval,
      isRecurring: true,
    };
  }

  private static readPaymentIntentId(invoice: unknown): string | null {
    if (typeof invoice !== 'object' || invoice === null) {
      return null;
    }
    if (!('payment_intent' in invoice)) {
      return null;
    }
    const paymentIntent: unknown = invoice.payment_intent;
    if (typeof paymentIntent === 'string' && paymentIntent.length > 0) {
      return paymentIntent;
    }
    if (typeof paymentIntent === 'object' && paymentIntent !== null && 'id' in paymentIntent) {
      const paymentIntentId: unknown = paymentIntent.id;
      if (typeof paymentIntentId === 'string' && paymentIntentId.length > 0) {
        return paymentIntentId;
      }
    }
    return null;
  }

  private translateRequestError(err: unknown): Error {
    if (err instanceof StripeFailureException) {
      return err;
    }
    const message: string = StripeManagerService.readStripeErrorMessage(err);
    this.logger.error(message, err instanceof Error ? err.stack : undefined);
    return new StripeFailureException(message);
  }

  private static readStripeErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }
    return 'Stripe request failed';
  }
}
