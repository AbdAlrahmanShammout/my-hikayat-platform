import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AdminApiModule } from './admin-api.module';

describe('AdminApiModule', () => {
  it('compiles with the authentication concern', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        AdminApiModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        book: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        category: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();
    const actualModule: AdminApiModule = moduleRef.get(AdminApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
