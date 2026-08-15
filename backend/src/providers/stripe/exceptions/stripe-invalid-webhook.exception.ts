import { AppException } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export class StripeInvalidWebhookException extends AppException {
  constructor() {
    super({
      message: 'Stripe webhook signature is invalid',
      code: 'STRIPE_INVALID_WEBHOOK',
      kind: ErrorKind.INVALID_STATE,
      userFriendly: false,
    });
  }
}
