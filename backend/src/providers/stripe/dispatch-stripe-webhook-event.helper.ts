import { STRIPE } from '@/providers/stripe/consts';
import { StripeWebhookEvent } from '@/providers/stripe/defs/stripe-manager.defs';
import { StripeEventHandlers } from '@/providers/stripe/interfaces/stripe-event-handlers.interface';

export type DispatchStripeWebhookEventInput = {
  readonly event: StripeWebhookEvent;
  readonly eventHandlers: StripeEventHandlers;
};

export async function dispatchStripeWebhookEvent(
  input: DispatchStripeWebhookEventInput,
): Promise<void> {
  if (input.event.type === STRIPE.webhookEventType.checkoutSessionCompleted) {
    await dispatchCheckoutCompleted(input);
    return;
  }
  if (input.event.type === STRIPE.webhookEventType.customerSubscriptionUpdated) {
    await dispatchSubscriptionUpdated(input);
    return;
  }
  if (input.event.type === STRIPE.webhookEventType.customerSubscriptionDeleted) {
    await dispatchSubscriptionCanceled(input);
  }
}

async function dispatchCheckoutCompleted(input: DispatchStripeWebhookEventInput): Promise<void> {
  const { event, eventHandlers } = input;
  if (
    event.clientReferenceId === null ||
    event.customerId === null ||
    event.subscriptionId === null
  ) {
    return;
  }
  await eventHandlers.handleCheckoutCompleted({
    customerId: event.customerId,
    subscriptionId: event.subscriptionId,
    clientReferenceId: event.clientReferenceId,
    currentPeriodStart: event.currentPeriodStart,
    currentPeriodEnd: event.currentPeriodEnd,
  });
}

async function dispatchSubscriptionUpdated(input: DispatchStripeWebhookEventInput): Promise<void> {
  if (isCanceledStatus(input.event.status)) {
    await dispatchSubscriptionCanceled(input);
    return;
  }
  if (input.event.subscriptionId === null) {
    return;
  }
  await input.eventHandlers.handleSubscriptionRenewed({
    customerId: input.event.customerId,
    subscriptionId: input.event.subscriptionId,
    currentPeriodStart: input.event.currentPeriodStart,
    currentPeriodEnd: input.event.currentPeriodEnd,
    status: input.event.status,
  });
}

async function dispatchSubscriptionCanceled(input: DispatchStripeWebhookEventInput): Promise<void> {
  if (input.event.subscriptionId === null) {
    return;
  }
  await input.eventHandlers.handleSubscriptionCanceled({
    customerId: input.event.customerId,
    subscriptionId: input.event.subscriptionId,
    currentPeriodEnd: input.event.currentPeriodEnd,
  });
}

function isCanceledStatus(status: string | null): boolean {
  if (status === null) {
    return false;
  }
  return (STRIPE.canceledStatuses as readonly string[]).includes(status);
}
