import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { PlanRepository } from '@/modules/subscription/repository/plan.repository';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { PlanService } from './plan.service';
import { SubscriptionBillingService } from './subscription-billing.service';
import { SubscriptionModule } from './subscription.module';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionModule', () => {
  it('binds the abstract repositories and exports the services', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, SubscriptionModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        plan: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        subscription: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      })
      .compile();
    expect(moduleRef.get(PlanService)).toBeDefined();
    expect(moduleRef.get(SubscriptionService)).toBeDefined();
    expect(moduleRef.get(SubscriptionBillingService)).toBeDefined();
    expect(moduleRef.get(PlanRepository)).toBeDefined();
    expect(moduleRef.get(SubscriptionRepository)).toBeDefined();
    await moduleRef.close();
  });
});
