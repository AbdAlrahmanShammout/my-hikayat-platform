import { Test, TestingModule } from '@nestjs/testing';

import { AdminApiModule } from './admin-api.module';
import { AuthorApiModule } from './author-api.module';
import { FeatureBundleModule } from './feature-bundle.module';
import { ReaderApiModule } from './reader-api.module';

describe('FeatureBundleModule', () => {
  it('aggregates the reader, author, and admin API modules', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [FeatureBundleModule],
    }).compile();
    const actualBundle: FeatureBundleModule = moduleRef.get(FeatureBundleModule);
    expect(actualBundle).toBeDefined();
    expect(moduleRef.get(ReaderApiModule)).toBeDefined();
    expect(moduleRef.get(AuthorApiModule)).toBeDefined();
    expect(moduleRef.get(AdminApiModule)).toBeDefined();
    await moduleRef.close();
  });
});
