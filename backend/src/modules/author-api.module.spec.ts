import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AuthorApiModule } from './author-api.module';

describe('AuthorApiModule', () => {
  it('compiles with the authentication concern', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        AuthorApiModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn() },
      })
      .compile();
    const actualModule: AuthorApiModule = moduleRef.get(AuthorApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
