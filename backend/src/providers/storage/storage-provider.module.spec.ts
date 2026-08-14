import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { S3StorageManagerService } from '@/providers/storage/s3/s3-storage-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { StorageProviderModule } from './storage-provider.module';

describe('StorageProviderModule', () => {
  it('binds the abstract manager to the S3-compatible implementation', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, StorageProviderModule],
    }).compile();
    const actualManager: StorageManagerService = moduleRef.get(StorageManagerService);
    expect(actualManager).toBeInstanceOf(S3StorageManagerService);
    await moduleRef.close();
  });
});
