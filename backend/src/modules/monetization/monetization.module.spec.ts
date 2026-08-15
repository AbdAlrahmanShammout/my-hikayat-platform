import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { RevenuePeriodRepository } from '@/modules/monetization/repository/revenue-period.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { MonetizationModule } from './monetization.module';
import { RevenuePeriodService } from './revenue-period.service';

describe('MonetizationModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, MonetizationModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        revenuePeriod: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(RevenuePeriodService)).toBeDefined();
    expect(moduleRef.get(RevenuePeriodRepository)).toBeDefined();
    await moduleRef.close();
  });
});
