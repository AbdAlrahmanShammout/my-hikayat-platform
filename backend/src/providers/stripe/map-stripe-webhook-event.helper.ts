import { STRIPE } from '@/providers/stripe/consts';
import {
  MapStripeWebhookEventInput,
  StripeWebhookEvent,
} from '@/providers/stripe/defs/stripe-manager.defs';

export function mapStripeWebhookEvent(input: MapStripeWebhookEventInput): StripeWebhookEvent {
  const object: Record<string, unknown> = isRecord(input.object) ? input.object : {};
  const objectId: string | null = readStripeId(object.id);
  return {
    id: input.id,
    type: input.type,
    objectId,
    customerId: readStripeId(object.customer),
    subscriptionId: resolveSubscriptionId(input.type, objectId, object.subscription),
    clientReferenceId: readString(object.client_reference_id),
    planId: readPlanId(object),
    currentPeriodStart: readPeriodField(object, 'current_period_start'),
    currentPeriodEnd: readPeriodField(object, 'current_period_end'),
    status: readString(object.status),
  };
}

function resolveSubscriptionId(
  type: string,
  objectId: string | null,
  nestedSubscription: unknown,
): string | null {
  const nestedId: string | null = readStripeId(nestedSubscription);
  if (nestedId !== null) {
    return nestedId;
  }
  if (
    type === STRIPE.webhookEventType.customerSubscriptionUpdated ||
    type === STRIPE.webhookEventType.customerSubscriptionDeleted
  ) {
    return objectId;
  }
  return null;
}

function readPlanId(object: Record<string, unknown>): string | null {
  if (isRecord(object.metadata)) {
    const fromMetadata: string | null = readString(object.metadata.planId);
    if (fromMetadata !== null) {
      return fromMetadata;
    }
  }
  return null;
}

function readPeriodField(
  object: Record<string, unknown>,
  field: 'current_period_start' | 'current_period_end',
): Date | null {
  const direct: Date | null = readUnixDate(object[field]);
  if (direct !== null) {
    return direct;
  }
  if (
    !isRecord(object.items) ||
    !Array.isArray(object.items.data) ||
    object.items.data.length === 0
  ) {
    return null;
  }
  const firstItem: unknown = object.items.data[0];
  if (!isRecord(firstItem)) {
    return null;
  }
  return readUnixDate(firstItem[field]);
}

function readStripeId(value: unknown): string | null {
  const direct: string | null = readString(value);
  if (direct !== null) {
    return direct;
  }
  if (!isRecord(value)) {
    return null;
  }
  return readString(value.id);
}

function readUnixDate(value: unknown): Date | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value * 1000);
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
