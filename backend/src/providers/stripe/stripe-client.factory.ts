import Stripe from 'stripe';

import { StripeConfigService } from '@/config/stripe/stripe-config.service';

export function createStripeClient(stripeConfigService: StripeConfigService): Stripe {
  return new Stripe(stripeConfigService.secretKey);
}
