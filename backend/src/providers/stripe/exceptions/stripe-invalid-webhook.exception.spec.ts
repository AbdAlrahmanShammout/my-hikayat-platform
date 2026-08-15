import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StripeInvalidWebhookException } from './stripe-invalid-webhook.exception';

describe('StripeInvalidWebhookException', () => {
  it('reports an invalid webhook signature without an HTTP status', () => {
    const actualException = new StripeInvalidWebhookException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('STRIPE_INVALID_WEBHOOK');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
