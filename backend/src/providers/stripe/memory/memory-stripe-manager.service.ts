import { Injectable } from '@nestjs/common';

import {
  ConstructStripeWebhookEventInput,
  CreateStripeCheckoutSessionInput,
  CreateStripeCustomerInput,
  StripeCheckoutSession,
  StripeCustomer,
  StripeWebhookEvent,
} from '@/providers/stripe/defs/stripe-manager.defs';
import { dispatchStripeWebhookEvent } from '@/providers/stripe/dispatch-stripe-webhook-event.helper';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeNotInitializedException } from '@/providers/stripe/exceptions/stripe-not-initialized.exception';
import { StripeEventHandlers } from '@/providers/stripe/interfaces/stripe-event-handlers.interface';
import { mapStripeWebhookEvent } from '@/providers/stripe/map-stripe-webhook-event.helper';

@Injectable()
export class MemoryStripeManagerService {
  private eventHandlers: StripeEventHandlers | null = null;

  initialize(eventHandlers: StripeEventHandlers): Promise<void> {
    this.eventHandlers = eventHandlers;
    return Promise.resolve();
  }

  createCustomer(input: CreateStripeCustomerInput): Promise<StripeCustomer> {
    return Promise.resolve({ customerId: `cus_memory_${input.clientReferenceId}` });
  }

  createCheckoutSession(input: CreateStripeCheckoutSessionInput): Promise<StripeCheckoutSession> {
    const checkoutSessionId = `cs_memory_${input.clientReferenceId}`;
    return Promise.resolve({
      checkoutSessionId,
      url: `https://checkout.stripe.test/${checkoutSessionId}`,
    });
  }

  constructWebhookEvent(input: ConstructStripeWebhookEventInput): StripeWebhookEvent {
    const parsed: unknown = MemoryStripeManagerService.parsePayload(input.payload);
    if (!MemoryStripeManagerService.isRecord(parsed)) {
      throw new StripeInvalidWebhookException();
    }
    const id: string | null = MemoryStripeManagerService.readString(parsed.id);
    const type: string | null = MemoryStripeManagerService.readString(parsed.type);
    if (id === null || type === null) {
      throw new StripeInvalidWebhookException();
    }
    const data: unknown = parsed.data;
    const object: unknown = MemoryStripeManagerService.isRecord(data) ? data.object : undefined;
    return mapStripeWebhookEvent({ id, type, object });
  }

  async processWebhook(input: ConstructStripeWebhookEventInput): Promise<void> {
    if (this.eventHandlers === null) {
      throw new StripeNotInitializedException();
    }
    await dispatchStripeWebhookEvent({
      event: this.constructWebhookEvent(input),
      eventHandlers: this.eventHandlers,
    });
  }

  private static parsePayload(payload: string | Buffer): unknown {
    try {
      const text: string = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
      return JSON.parse(text) as unknown;
    } catch {
      throw new StripeInvalidWebhookException();
    }
  }

  private static readString(value: unknown): string | null {
    if (typeof value !== 'string' || value.length === 0) {
      return null;
    }
    return value;
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
