import { Test, TestingModule } from '@nestjs/testing';

import { AdminApiModule } from '@/modules/admin-api.module';
import { AuthorApiModule } from '@/modules/author-api.module';
import { FeatureBundleModule } from '@/modules/feature-bundle.module';
import { ReaderApiModule } from '@/modules/reader-api.module';

import { AppModule } from './app.module';

describe('AppModule', () => {
  it('compiles the root module with the feature aggregator', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const actualAppModule: AppModule = moduleRef.get(AppModule);
    expect(actualAppModule).toBeDefined();
    expect(moduleRef.get(FeatureBundleModule)).toBeDefined();
    expect(moduleRef.get(ReaderApiModule)).toBeDefined();
    expect(moduleRef.get(AuthorApiModule)).toBeDefined();
    expect(moduleRef.get(AdminApiModule)).toBeDefined();
    await moduleRef.close();
  });
});
