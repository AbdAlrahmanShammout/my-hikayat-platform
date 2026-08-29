import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class PlanStripePriceConflictException extends ResourceConflictException {
  constructor(stripePriceId: string) {
    super({
      message: `Plan with Stripe price "${stripePriceId}" already exists`,
      code: 'PLAN_STRIPE_PRICE_CONFLICT',
    });
  }
}
