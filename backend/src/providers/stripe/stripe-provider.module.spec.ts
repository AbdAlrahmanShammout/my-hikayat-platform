import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

import { StripeProviderModule } from './stripe-provider.module';

describe('StripeProviderModule', () => {
  it('exports the Stripe manager when configuration is loaded', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, StripeProviderModule],
    }).compile();
    expect(moduleRef.get(StripeManagerService)).toBeDefined();
    await moduleRef.close();
  });
});
