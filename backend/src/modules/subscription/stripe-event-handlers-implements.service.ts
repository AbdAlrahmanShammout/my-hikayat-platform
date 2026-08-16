import { Injectable, OnModuleInit } from '@nestjs/common';

import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import {
  HandleCheckoutCompletedInput,
  HandleInvoicePaymentFailedInput,
  HandleSubscriptionCanceledInput,
  HandleSubscriptionRenewedInput,
} from '@/providers/stripe/defs/stripe-manager.defs';
import { StripeEventHandlers } from '@/providers/stripe/interfaces/stripe-event-handlers.interface';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

@Injectable()
export class StripeEventHandlersImplementsService implements StripeEventHandlers, OnModuleInit {
  constructor(
    private readonly stripeManagerService: StripeManagerService,
    private readonly subscriptionBillingService: SubscriptionBillingService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.stripeManagerService.initialize(this);
  }

  async handleCheckoutCompleted(input: HandleCheckoutCompletedInput): Promise<void> {
    await this.subscriptionBillingService.applyCheckoutCompleted(input);
  }

  async handleSubscriptionRenewed(input: HandleSubscriptionRenewedInput): Promise<void> {
    await this.subscriptionBillingService.applySubscriptionRenewed(input);
  }

  async handleSubscriptionCanceled(input: HandleSubscriptionCanceledInput): Promise<void> {
    await this.subscriptionBillingService.applySubscriptionCanceled(input);
  }

  async handleInvoicePaymentFailed(input: HandleInvoicePaymentFailedInput): Promise<void> {
    await this.subscriptionBillingService.applyInvoicePaymentFailed(input);
  }
}
