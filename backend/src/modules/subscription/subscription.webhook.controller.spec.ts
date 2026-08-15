import { Test, TestingModule } from '@nestjs/testing';

import { StripeWebhookReceivedResponseDto } from '@/modules/subscription/dto/response/stripe-webhook-received-response.dto';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';

import { SubscriptionWebhookController } from './subscription.webhook.controller';

describe('SubscriptionWebhookController', () => {
  let subscriptionWebhookController: SubscriptionWebhookController;
  let mockSubscriptionBillingService: { receiveWebhook: jest.Mock };

  beforeEach(async () => {
    mockSubscriptionBillingService = { receiveWebhook: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionWebhookController],
      providers: [
        { provide: SubscriptionBillingService, useValue: mockSubscriptionBillingService },
      ],
    }).compile();
    subscriptionWebhookController = moduleRef.get(SubscriptionWebhookController);
  });

  it('forwards the raw payload and Stripe signature to billing', async () => {
    mockSubscriptionBillingService.receiveWebhook.mockResolvedValue(undefined);
    const payload = Buffer.from('{"id":"evt_1"}');
    const actualResponse: StripeWebhookReceivedResponseDto =
      await subscriptionWebhookController.receiveWebhook('t=1,v1=sig', payload);
    expect(mockSubscriptionBillingService.receiveWebhook).toHaveBeenCalledWith({
      payload,
      signature: 't=1,v1=sig',
    });
    expect(actualResponse.received).toBe(true);
  });
});
