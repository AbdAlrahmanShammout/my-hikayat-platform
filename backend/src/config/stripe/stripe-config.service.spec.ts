import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { StripeConfigService } from './stripe-config.service';

describe('StripeConfigService', () => {
  let stripeConfigService: StripeConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [StripeConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    stripeConfigService = moduleRef.get(StripeConfigService);
  });

  describe('secretKey', () => {
    it('returns the configured Stripe secret key', () => {
      mockConfigService.get.mockReturnValue('sk_test_secret');
      const actualSecretKey: string = stripeConfigService.secretKey;
      expect(actualSecretKey).toBe('sk_test_secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('stripe.secretKey');
    });
  });

  describe('webhookSecret', () => {
    it('returns the configured Stripe webhook secret', () => {
      mockConfigService.get.mockReturnValue('whsec_test_secret');
      const actualWebhookSecret: string = stripeConfigService.webhookSecret;
      expect(actualWebhookSecret).toBe('whsec_test_secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('stripe.webhookSecret');
    });
  });
});
