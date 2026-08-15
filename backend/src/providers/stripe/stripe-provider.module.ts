import { Module } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeConfigService } from '@/config/stripe/stripe-config.service';
import { createStripeClient } from '@/providers/stripe/stripe-client.factory';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

@Module({
  providers: [
    {
      provide: Stripe,
      useFactory: createStripeClient,
      inject: [StripeConfigService],
    },
    StripeManagerService,
  ],
  exports: [StripeManagerService],
})
export class StripeProviderModule {}
