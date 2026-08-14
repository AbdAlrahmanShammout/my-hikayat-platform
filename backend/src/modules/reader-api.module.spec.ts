import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReaderApiModule } from './reader-api.module';

describe('ReaderApiModule', () => {
  it('compiles with the authentication concern', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        ReaderApiModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn() },
      })
      .compile();
    const actualModule: ReaderApiModule = moduleRef.get(ReaderApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
