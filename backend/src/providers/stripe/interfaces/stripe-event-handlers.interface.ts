import {
  HandleCheckoutCompletedInput,
  HandleSubscriptionCanceledInput,
  HandleSubscriptionRenewedInput,
} from '@/providers/stripe/defs/stripe-manager.defs';

export interface StripeEventHandlers {
  handleCheckoutCompleted(input: HandleCheckoutCompletedInput): Promise<void>;
  handleSubscriptionRenewed(input: HandleSubscriptionRenewedInput): Promise<void>;
  handleSubscriptionCanceled(input: HandleSubscriptionCanceledInput): Promise<void>;
}
