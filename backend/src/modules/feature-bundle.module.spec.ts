import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { AdminApiModule } from '@/modules/admin-api.module';
import { AuthorApiModule } from '@/modules/author-api.module';
import { FeatureBundleModule } from '@/modules/feature-bundle.module';
import { ReaderApiModule } from '@/modules/reader-api.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

describe('FeatureBundleModule', () => {
  it('aggregates the reader, author, and admin API modules', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        FeatureBundleModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      })
      .compile();
    const actualBundle: FeatureBundleModule = moduleRef.get(FeatureBundleModule);
    expect(actualBundle).toBeDefined();
    expect(moduleRef.get(ReaderApiModule)).toBeDefined();
    expect(moduleRef.get(AuthorApiModule)).toBeDefined();
    expect(moduleRef.get(AdminApiModule)).toBeDefined();
    await moduleRef.close();
  });
});
